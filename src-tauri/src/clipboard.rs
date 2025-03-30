use arboard::Clipboard;
use serde::{Deserialize, Serialize};
use std::{
    fs::{File, OpenOptions},
    io::{BufRead, BufReader, Write},
    sync::Mutex,
    thread,
    time::Duration,
};
use tauri::{Emitter, Manager};

#[derive(Serialize, Deserialize, Clone)]
pub struct ClipboardEntry {
    pub content: String,
    pub timestamp: String,
    pub id: String,
}

static LAST_TEXT: Mutex<String> = Mutex::new(String::new());
const LOG_PATH: &str = "clipboard-log.json";
const MAX_ENTRIES: usize = 100;

#[tauri::command]
pub fn start_clipboard_watcher(app_handle: tauri::AppHandle) {
    thread::spawn(move || {
        let mut clipboard = Clipboard::new().expect("Impossibile accedere alla clipboard");

        loop {
            if let Ok(text) = clipboard.get_text() {
                let mut last = LAST_TEXT.lock().unwrap();

                if text != *last {
                    *last = text.clone();

                    let entry = ClipboardEntry {
                        content: text.clone(),
                        timestamp: chrono::Utc::now().to_rfc3339(),
                        id: uuid::Uuid::new_v4().to_string(),
                    };

                    // Leggi log esistente
                    let mut entries = read_log();

                    // Rimuove eventuali duplicati
                    entries.retain(|e| e.content != entry.content);

                    // Inserisce comunque in cima
                    entries.insert(0, entry);

                    // Tronca se serve
                    if entries.len() > MAX_ENTRIES {
                        entries.truncate(MAX_ENTRIES);
                    }

                    // Sovrascrivi il file
                    if let Ok(mut file) = File::create(LOG_PATH) {
                        for e in &entries {
                            if let Ok(line) = serde_json::to_string(e) {
                                let _ = writeln!(file, "{}", line);
                            }
                        }
                    }

                    // Manda TUTTO il log al frontend
                    send_event_to_frontend(&app_handle, entries);
                }
            }

            thread::sleep(Duration::from_secs(1));
        }
    });
}

pub fn send_event_to_frontend(app_handle: &tauri::AppHandle, entries: Vec<ClipboardEntry>) {
    app_handle.emit("clipboard-changed", entries).unwrap();
}

pub fn read_log() -> Vec<ClipboardEntry> {
    if let Ok(file) = File::open(LOG_PATH) {
        BufReader::new(file)
            .lines()
            .filter_map(|line| line.ok().and_then(|l| serde_json::from_str(&l).ok()))
            .collect()
    } else {
        vec![]
    }
}
