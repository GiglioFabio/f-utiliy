use crate::update_tray_menu;
use arboard::Clipboard;
use enigo::{Enigo, Key, KeyboardControllable};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::{
    fs::File,
    io::{BufRead, BufReader, Write},
    sync::Mutex,
    thread,
    time::Duration,
};
use tauri::Emitter;

use crate::utils::paths::get_app_base_path;

#[derive(Serialize, Deserialize, Clone)]
pub struct ClipboardEntry {
    pub content: String,
    pub timestamp: String,
    pub id: String,
}

static LAST_TEXT: Mutex<String> = Mutex::new(String::new());
const MAX_ENTRIES: usize = 100;

// -------------Commands------------

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
                    if let Ok(mut file) = File::create(get_log_path()) {
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

#[tauri::command]
pub fn get_clipboard_log() -> Vec<ClipboardEntry> {
    //read first time
    let first_entries = read_log();
    // for entry in &first_entries {
    //     println!("📝 {} @ {}", entry.content, entry.timestamp);
    // }
    return first_entries;
}

// -------------------------
pub fn send_event_to_frontend(app_handle: &tauri::AppHandle, entries: Vec<ClipboardEntry>) {
    app_handle.emit("clipboard-changed", entries).unwrap();
    let _ = update_tray_menu(app_handle);
}

pub fn read_log() -> Vec<ClipboardEntry> {
    if let Ok(file) = File::open(get_log_path()) {
        BufReader::new(file)
            .lines()
            .filter_map(|line| line.ok().and_then(|l| serde_json::from_str(&l).ok()))
            .collect()
    } else {
        vec![]
    }
}

fn get_log_path() -> PathBuf {
    let mut base_dir = get_app_base_path();
    base_dir.push("clipboard-watcher");
    std::fs::create_dir_all(&base_dir).ok();
    base_dir.join("clipboard-log.json")
}

pub fn clear_format_current_clipboard() {
    if let Ok(mut clipboard) = Clipboard::new() {
        if let Ok(text) = clipboard.get_text() {
            let cleaned = text.trim().to_string();
            set_clipboard_text(&cleaned);
        }
    }
}

pub fn set_clipboard_text(text: &str) {
    if let Ok(mut clipboard) = Clipboard::new() {
        let _ = clipboard.set_text(text.to_string());
    }
}

pub fn simulate_cmd_v() {
    thread::sleep(Duration::from_millis(150));
    let mut enigo = Enigo::new();

    #[cfg(target_os = "windows")]
    let modifier = Key::Control;

    #[cfg(target_os = "macos")]
    let modifier = Key::Meta;

    enigo.key_down(modifier);
    enigo.key_click(Key::Layout('v'));
    enigo.key_up(modifier);
}
