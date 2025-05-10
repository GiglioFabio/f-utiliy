use once_cell::sync::Lazy;
use std::process::Command;
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::time::Duration;

use tauri::{AppHandle, Manager};

#[derive(Debug)]
struct TrackInfo {
    title: String,
    artist: String,
    album: String,
    duration: u32,
    position: u32,
    state: String,
}

static MONITORING_STATE: Lazy<AtomicBool> = Lazy::new(|| AtomicBool::new(false));

#[tauri::command]
pub fn set_spotify_monitoring_state(app_handle: AppHandle, state: bool) {
    println!("🔒 Spotify monitoring state: {}", state);
    MONITORING_STATE.store(state, Ordering::SeqCst);
}

// only for macOS
#[cfg(target_os = "macos")]
pub fn start_spotify_watcher(app_handle: tauri::AppHandle) {
    // Volume di default (setta a 50% se non esiste)
    let mut original_volume: i32 = get_volume();
    let millisecond_checks = 500;

    thread::spawn(move || {
        loop {
            // if app_handle.try_state::<AppState>().is_err() {
            //     println!("🛑 App chiusa, termino il thread.");
            //     break;
            // }

            if !MONITORING_STATE.load(Ordering::SeqCst) {
                println!("🔒 Monitoring spotify disabilitato...");
                thread::sleep(Duration::from_secs(10));
                continue;
            }

            // check if Spotify is running
            let output_running = Command::new("osascript")
            .arg("-e")
            .arg("tell application \"System Events\" to (name of processes) contains \"Spotify\"")
            .output()
            .expect("Errore durante il recupero dello stato di Spotify");

            if !output_running.stdout.is_empty() {
                let running_str = String::from_utf8_lossy(&output_running.stdout)
                    .trim()
                    .to_string();
                if running_str == "false" {
                    println!("⚠️ Spotify non è in esecuzione...");
                    thread::sleep(Duration::from_secs(30));
                    continue;
                }
            }

            // Esegui l'AppleScript per ottenere i dati
            let output = Command::new("osascript")
            .arg("-e")
            .arg(
                "tell application \"Spotify\"
                    if player state is playing or player state is paused then
                        set trackName to name of current track
                        set artistName to artist of current track
                        set albumName to album of current track
                        set position to player position
                        set state to player state
                        
                        -- Prova a ottenere la durata del brano
                        try
                            set trackDuration to duration of current track
                        on error
                            set trackDuration to 0
                        end try
                        
                        -- Restituisci tutto concatenato
                        return trackName & \"|\" & artistName & \"|\" & albumName & \"|\" & trackDuration & \"|\" & position & \"|\" & state
                    else
                        return \"no_track|no_artist|no_album|0|0|stopped\"
                    end if
                end tell",
            )
            .output()
            .expect("Errore durante l'esecuzione di AppleScript");

            // Conversione dell'output da byte a stringa
            let response = String::from_utf8_lossy(&output.stdout).trim().to_string();

            // Parsing dell'array
            let parts: Vec<&str> = response.split('|').collect();

            // println!("Spotify response: {}", response);
            if parts.len() == 6 {
                let track_info = TrackInfo {
                    title: parts[0].to_string(),
                    artist: parts[1].to_string(),
                    album: parts[2].to_string(),
                    duration: parts[3].parse::<u32>().unwrap_or(0),
                    position: parts[4].parse::<u32>().unwrap_or(0),
                    state: parts[5].to_string(),
                };

                if track_info.state == "paused" {
                    // println!("Spotify è in pausa...");
                    // try to get the adv
                } else if (track_info.artist.is_empty() || track_info.artist == " ")
                    && (track_info.album.is_empty() || track_info.album == " ")
                    || track_info.duration < 35000
                // 35 secondi
                {
                    println!("{:#?}", track_info);
                    println!("⚠️ Maybe adv! Metto in muto...");
                    set_volume(0); // Muto
                } else {
                    if get_volume() == 0 {
                        // Se il volume è 0, ripristina il volume originale
                        set_volume(original_volume);
                    } else {
                        original_volume = get_volume(); // Salvo il volume corrente
                    }
                }
            } else {
                println!("⚠️  Errore nel parsing dei dati");
            }

            // Attendere  prima del prossimo check
            thread::sleep(Duration::from_millis(millisecond_checks));
        }
    });
}

// Funzione per ottenere il volume corrente del sistema
fn get_volume() -> i32 {
    let output = Command::new("osascript")
        .arg("-e")
        .arg("output volume of (get volume settings)")
        .output()
        .expect("Errore durante il recupero del volume");

    let volume_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
    volume_str.parse::<i32>().unwrap_or(50)
}

// Funzione per settare il volume di sistema
fn set_volume(volume: i32) {
    Command::new("osascript")
        .arg("-e")
        .arg(format!("set volume output volume {}", volume))
        .output()
        .expect("Errore durante l'impostazione del volume");
}
