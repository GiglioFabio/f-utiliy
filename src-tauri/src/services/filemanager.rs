use crate::update_tray_menu;
use crate::utils::paths::get_app_base_path;
use serde::{Deserialize, Serialize};
use std::{
    fs::File,
    io::{BufRead, BufReader, Write},
    path::{self, PathBuf},
};
use tauri::Emitter;

const MAX_ENTRIES: usize = 500;

#[derive(Serialize, Deserialize, Clone)]
pub struct RecentFileEntry {
    pub path: String,
    pub name: String,
    pub tags: Vec<String>,
}

// -------------Commands------------
#[tauri::command]
pub fn open_file(path: String) -> Result<(), String> {
    println!("try open file.");
    open::that(path).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn reveal_in_folder(path: String) -> Result<(), String> {
    println!("try reveal folder.");
    let folder = std::path::Path::new(&path)
        .parent()
        .ok_or("Non è possibile determinare la cartella.")?;
    open::that(folder).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn add_recent_file(
    app_handle: tauri::AppHandle,
    path: String,
    name: String,
    tags: Vec<String>,
) {
    let entry = RecentFileEntry {
        path: path,
        name: name,
        tags: tags,
    };

    // Leggi log esistente
    let mut entries = read_recent_files();

    // Rimuove eventuali duplicati
    entries.retain(|e| e.path != entry.path);

    // Inserisce comunque in cima
    entries.insert(0, entry);

    // Tronca se serve
    if entries.len() > MAX_ENTRIES {
        entries.truncate(MAX_ENTRIES);
    }

    // Sovrascrivi il file
    if let Ok(mut file) = File::create(get_recent_file_path()) {
        for e in &entries {
            if let Ok(line) = serde_json::to_string(e) {
                let _ = writeln!(file, "{}", line);
            }
        }
    }

    // Manda TUTTO il log al frontend
    send_event_to_frontend(&app_handle, entries);
}

#[tauri::command]
pub fn load_recent_files() -> Vec<RecentFileEntry> {
    //read first time
    let first_entries = read_recent_files();
    // for entry in &first_entries {
    //     println!("📝 {} @ {}", entry.content, entry.timestamp);
    // }
    return first_entries;
}

#[tauri::command]
pub fn clear_single_recent_file(path: String) {
    let mut entries = read_recent_files();
    entries.retain(|e| e.path != path);

    println!("🗑️  {}", path);

    // Sovrascrivi il file
    if let Ok(mut file) = File::create(get_recent_file_path()) {
        for e in &entries {
            if let Ok(line) = serde_json::to_string(e) {
                let _ = writeln!(file, "{}", line);
            }
        }
    }
}
// -------- FUNTIONS -------

pub fn read_recent_files() -> Vec<RecentFileEntry> {
    if let Ok(file) = File::open(get_recent_file_path()) {
        BufReader::new(file)
            .lines()
            .filter_map(|line| line.ok().and_then(|l| serde_json::from_str(&l).ok()))
            .collect()
    } else {
        vec![]
    }
}

pub fn send_event_to_frontend(app_handle: &tauri::AppHandle, entries: Vec<RecentFileEntry>) {
    app_handle.emit("recents-changed", entries).unwrap();
    let _ = update_tray_menu(app_handle);
}

fn get_recent_file_path() -> PathBuf {
    let mut base_dir = get_app_base_path();
    base_dir.push("recent_files");
    std::fs::create_dir_all(&base_dir).ok();
    base_dir.join("recent_file.json")
}
