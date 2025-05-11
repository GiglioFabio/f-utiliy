use crate::utils::paths::get_app_base_path;
use chrono::Local;
use once_cell::sync::Lazy;
use regex::Regex;
use std::fs;
use std::io::Write;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, RwLock};
use std::thread;
use std::time::Duration;
use tauri::Window;
use tauri::{AppHandle, Manager};
use tauri_plugin_opener::OpenerExt;

static MONITORING_STATE: Lazy<AtomicBool> = Lazy::new(|| AtomicBool::new(false));
static STARTED_RECORD_MANUALLY: Lazy<AtomicBool> = Lazy::new(|| AtomicBool::new(false));

static FFMPEG_PROCESS: Lazy<Arc<RwLock<Option<Child>>>> = Lazy::new(|| Arc::new(RwLock::new(None)));

const FFMPEG_PATH: &str = "/usr/local/bin/ffmpeg";

fn get_recording_folder() -> PathBuf {
    let mut base_dir = get_app_base_path();
    base_dir.push("video_recording");
    std::fs::create_dir_all(&base_dir).ok();
    base_dir
}

pub fn start_teams_monitoring() {
    println!("🛰️ Avvio monitoraggio di Microsoft Teams...");

    thread::spawn(move || {
        loop {
            if !MONITORING_STATE.load(Ordering::SeqCst) {
                println!("🔒 Monitoring Microsoft Teams disabilitato...");
                thread::sleep(Duration::from_secs(10));
                continue;
            }

            // AppleScript per ottenere le finestre di Microsoft Teams
            let output = Command::new("osascript")
                .arg("-e")
                .arg(
                    r#"
                tell application "System Events"
                    tell process "Microsoft Teams"
                        set windowNames to name of every window
                    end tell
                end tell
                return windowNames as string
                "#,
                )
                .output()
                .expect("Errore durante l'esecuzione di AppleScript");

            let window_names = String::from_utf8_lossy(&output.stdout).trim().to_string();

            // Divide i nomi delle finestre in un vettore di stringhe
            let window_list: Vec<String> =
                window_names.split(", ").map(|s| s.to_string()).collect();
            println!("🪟 Finestre di Microsoft Teams trovate: {:?}", window_list);
            // MicrosoftTeamsTestMeeting
            let re = Regex::new(r"Microsoft Teams\w+").unwrap();

            let mut count = 0;
            for window in &window_list {
                if window.contains("Visualizzazione compatta delle riunioni") || re.is_match(window)
                {
                    println!("⚠️ Finestra di Microsoft Teams trovata: {}", window);
                    count += 1;
                }
            }

            // Log di debug
            let now = Local::now();
            println!(
                "🕒 {} - Trovate {} finestre di Microsoft Teams",
                now.format("%Y-%m-%d %H:%M:%S"),
                count
            );

            if count >= 1 {
                match start_recording(get_teams_meeting_name(), false) {
                    Ok(path) => println!("✅ Registrazione avviata con successo: {}", path),
                    Err(err) => println!("❌ Errore nell'avvio della registrazione: {}", err),
                }
            } else {
                // Arresta la registrazione se necessario
                if !STARTED_RECORD_MANUALLY.load(Ordering::SeqCst) {
                    if let Err(err) = stop_recording() {
                        println!("❌ Errore durante l'arresto: {}", err);
                    }
                }
            }

            thread::sleep(Duration::from_secs(5));
        }
    });
}

fn start_recording(file_name: Option<String>, is_manual_recordig: bool) -> Result<String, String> {
    println!("🚀 Tentativo di avvio della registrazione...");

    // 🔒 Prova ad acquisire un lock in scrittura
    let mut process_guard = FFMPEG_PROCESS
        .write()
        .map_err(|_| "❌ Impossibile ottenere il lock in scrittura.".to_string())?;

    if process_guard.is_some() {
        return Err("⚠️ Registrazione già in corso!".to_string());
    }

    println!("🔴 Avvio registrazione video...");

    STARTED_RECORD_MANUALLY.store(is_manual_recordig, Ordering::SeqCst);

    // 🗂️ Creazione della cartella di output
    let recording_folder = get_recording_folder();
    // set max length of file name
    let mut video_name = file_name.unwrap_or_else(|| "video_recording.mp4".to_string());
    video_name = sanitize_filename(video_name);
    video_name.truncate(30);

    let file_name = format!(
        "{}_{}.mp4",
        video_name,
        Local::now().format("%Y%m%d_%H%M%S")
    );

    let mut output_path = recording_folder;
    output_path.push(file_name);

    // ffmpeg -f avfoundation -list_devices true -i ""

    // CHeck configurazione MIDI audio to see the channel with Blackhole 2ch
    // 🚀 Avvio di `ffmpeg`
    let process = Command::new(FFMPEG_PATH)
        .args(&[
            "-f",
            "avfoundation",
            "-i",
            "1:0", // Schermo principale e audio di sistema
            "-r",
            "30",
            "-y",
            output_path.to_str().unwrap(),
        ])
        .stdin(Stdio::piped()) // <--- abilita l'invio di comandi
        .spawn()
        .map_err(|err| format!("❌ Errore nell'avvio della registrazione: {}", err))?;

    *process_guard = Some(process); // 🔒 Salvo il processo nel lock
    println!("✅ Registrazione avviata: {}", output_path.display());

    Ok(output_path.display().to_string())
}

pub fn stop_recording() -> Result<(), String> {
    let mut process_guard = FFMPEG_PROCESS.write().unwrap();

    STARTED_RECORD_MANUALLY.store(false, Ordering::SeqCst);

    if let Some(process) = process_guard.as_mut() {
        if let Some(stdin) = process.stdin.as_mut() {
            stdin
                .write_all(b"q\n")
                .map_err(|e| format!("❌ Errore nell'invio del comando di stop: {}", e))?;
            println!("✅ Comando di terminazione inviato con successo!");
        } else {
            return Err("⚠️ Stdin non disponibile per il processo.".to_string());
        }

        *process_guard = None;
        Ok(())
    } else {
        Err("⚠️ Nessuna registrazione in corso.".to_string())
    }
}

#[tauri::command]
pub fn set_calls_monitoring_state(state: bool) {
    println!("🔒 Call monitoring state: {}", state);
    MONITORING_STATE.store(state, Ordering::SeqCst);
}

#[tauri::command]
pub fn start_video_recording_invoke() {
    println!("Avvio registrazione video...");

    thread::spawn(move || {
        let _ = start_recording(None, true);
    });
}

#[tauri::command]
pub fn stop_video_recording_invoke() {
    println!("Arresto registrazione video...");
    thread::spawn(move || {
        let _ = stop_recording();
    });
}

#[tauri::command]
pub fn delete_file_recording(path: String) -> Result<(), String> {
    std::fs::remove_file(path).map_err(|e| format!("Errore nella cancellazione del file: {}", e))
}
#[tauri::command]
pub fn open_recording_folder(window: Window) -> Result<(), String> {
    let folder = get_recording_folder();
    let folder_path = folder.to_str().unwrap();

    window
        .opener()
        .open_path(folder_path, None::<&str>)
        .map_err(|e| format!("Errore nell'apertura della cartella: {}", e))
}
#[tauri::command]
pub fn create_transcript(path: String) -> Result<String, String> {
    // Placeholder: qui andrà l'implementazione di Whisper o altro tool
    println!("Creazione transcript per il file: {}", path);
    Ok(format!("Transcript per {} creato con successo.", path))
}

#[tauri::command]
pub fn get_recorded_files() -> Result<Vec<(String, String)>, String> {
    let recording_folder = get_recording_folder();

    // Controllo se la directory esiste
    if !recording_folder.exists() {
        return Err("La cartella di registrazione non esiste.".to_string());
    }

    // Legge i file presenti
    let files = fs::read_dir(recording_folder)
        .map_err(|e| format!("Errore nel recupero dei file: {}", e))?
        .filter_map(|entry| entry.ok())
        .filter(|entry| entry.path().is_file()) // Considera solo i file
        .map(|entry| {
            let path = entry.path();
            let file_name = path
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("File Sconosciuto")
                .to_string();

            (file_name, path.to_str().unwrap_or_default().to_string())
        })
        .collect::<Vec<(String, String)>>();

    // Ritorno esplicito di Ok()
    Ok(files)
}

#[tauri::command]
pub fn open_file_recording(window: Window, path: String) -> Result<(), String> {
    window
        .opener()
        .open_path(&path, None::<&str>)
        .map_err(|e| format!("Errore nell'apertura del file: {}", e))
}

fn get_teams_meeting_name() -> Option<String> {
    let output = Command::new("osascript")
        .arg("-e")
        .arg(
            r#"
            tell application "System Events"
                tell process "Microsoft Teams"
                    set windowNames to name of every window
                end tell
            end tell
        "#,
        )
        .output()
        .expect("Errore durante l'esecuzione di AppleScript");

    let window_list = String::from_utf8_lossy(&output.stdout);

    // Cerchiamo il nome della finestra che contiene la call
    window_list
        .lines()
        .find(|line| line.contains("Microsoft Teams,"))
        .map(|s| {
            let clean_name = s.replace("Microsoft Teams, ", "");
            clean_name.replace("/", "-") // Sostituire eventuali slash per evitare problemi con il path
        })
}

fn sanitize_filename<S: AsRef<str>>(input: S) -> String {
    let input = input.as_ref();
    let mut sanitized = String::with_capacity(input.len());
    for c in input.chars() {
        match c {
            // Caratteri non validi nei nomi di file su Windows
            '\\' | '/' | ':' | '*' | '?' | '"' | '<' | '>' | '|' => {
                // Sostituisci con un trattino basso o un altro carattere a tua scelta
                sanitized.push('_');
            }
            // Caratteri di controllo ASCII (0x00 - 0x1F)
            c if c.is_control() => {
                // Ignora i caratteri di controllo
            }
            _ => sanitized.push(c),
        }
    }
    sanitized
}
