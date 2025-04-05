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
