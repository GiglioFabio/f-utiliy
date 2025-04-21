use crate::utils::paths::get_app_base_path;
use serde::{Deserialize, Serialize};
use std::{
    fs::File,
    io::{BufRead, BufReader, Read, Write},
    path::PathBuf,
};
use tauri::Emitter;

// const MAX_ENTRIES: usize = 500;
const PATH_DRAWING_FILES: &str = "drawing_files";

#[derive(Serialize, Deserialize, Clone)]
pub struct DrawingtFileEntry {
    pub id: String,
    pub name: String,
}

// -------------Commands------------

#[tauri::command]
pub fn load_drawing_files() -> Vec<DrawingtFileEntry> {
    //read first time
    let first_entries = read_drawing_files();
    // for entry in &first_entries {
    //     println!("📝 {} @ {}", entry.content, entry.timestamp);
    // }
    return first_entries;
}

#[tauri::command]
pub fn read_data_single_drawing_file(id: String) -> Result<String, String> {
    let mut data = String::new();
    if let Ok(file) = File::open(get_drawing_data_path(id.clone())) {
        let mut reader = BufReader::new(file);
        if reader.read_to_string(&mut data).is_ok() {
            return Ok(data);
        }
    }
    Err(format!("Impossibile leggere il file per id: {}", id))
}

#[tauri::command]
pub fn clear_single_drawing_file(app_handle: tauri::AppHandle, id: String) {
    let mut entries = read_drawing_files();
    entries.retain(|e| e.id != id);

    // Rimuovi il file di dati
    let _ = std::fs::remove_file(get_drawing_data_path(id.clone()));

    // Sovrascrivi il file con la lista aggiornata
    if let Ok(mut file) = File::create(get_drawing_file_path()) {
        for e in &entries {
            if let Ok(line) = serde_json::to_string(e) {
                let _ = writeln!(file, "{}", line);
            }
        }
    }

    // Notifica al frontend che è stato rimosso
    let _ = app_handle.emit("drawing-deleted", id);
}

#[tauri::command]
pub fn save_drawing_data(id: String, name: String, data: String) {
    println!("Salvataggio del file di disegno con ID: {}", id);
    println!("Nome del file: {}", name);
    // println!("Dati del disegno: {}", data);

    let _ = std::fs::create_dir_all(get_drawing_data_path("".into()).parent().unwrap());

    if let Ok(mut file) = File::create(get_drawing_data_path(id.clone())) {
        if file.write_all(data.as_bytes()).is_ok() {
            add_drawing_file(name, id);
        }
    }
}

#[tauri::command]
pub fn save_drawing_to_file(path: String, data: Vec<u8>) {
    println!("Salvataggio del file di disegno in PNG: {}", path);

    if let Ok(mut file) = File::create(&path) {
        if file.write_all(&data).is_ok() {
            println!("File salvato correttamente in PNG: {}", path);
        } else {
            println!("Errore durante il salvataggio del file in PNG");
        }
    } else {
        println!("Impossibile creare il file PNG: {}", path);
    }
}

#[tauri::command]
pub fn read_json_drawing_file(path: String) -> Result<String, String> {
    let mut data = String::new();
    if let Ok(file) = File::open(path) {
        let mut reader = BufReader::new(file);
        if reader.read_to_string(&mut data).is_ok() {
            return Ok(data);
        }
    }
    Err(format!("Impossibile leggere il file per json: "))
}

// -------- FUNTIONS -------

pub fn read_drawing_files() -> Vec<DrawingtFileEntry> {
    if let Ok(file) = File::open(get_drawing_file_path()) {
        BufReader::new(file)
            .lines()
            .filter_map(|line| line.ok().and_then(|l| serde_json::from_str(&l).ok()))
            .collect()
    } else {
        vec![]
    }
}

fn get_drawing_file_path() -> PathBuf {
    let mut base_dir = get_app_base_path();
    base_dir.push(PATH_DRAWING_FILES);
    std::fs::create_dir_all(&base_dir).ok();
    base_dir.join("drawing_file.json")
}

fn get_drawing_data_path(id: String) -> PathBuf {
    let mut base_dir = get_app_base_path();
    base_dir.push(PATH_DRAWING_FILES);
    base_dir.push("data");
    std::fs::create_dir_all(&base_dir).ok();
    base_dir.join(id + ".json")
}

fn add_drawing_file(name: String, id: String) {
    let entry = DrawingtFileEntry { name: name, id: id };

    // Leggi log esistente
    let mut entries = read_drawing_files();

    // Rimuove eventuali duplicati
    entries.retain(|e| e.id != entry.id);

    // Inserisce comunque in cima
    entries.insert(0, entry);

    // Tronca se serve
    // if entries.len() > MAX_ENTRIES {
    //     entries.truncate(MAX_ENTRIES);
    // }

    // Sovrascrivi il file
    if let Ok(mut file) = File::create(get_drawing_file_path()) {
        for e in &entries {
            if let Ok(line) = serde_json::to_string(e) {
                let _ = writeln!(file, "{}", line);
            }
        }
    }
}
