use clipboard::ClipboardEntry;
use uuid::Uuid;
mod clipboard;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

#[tauri::command]
fn get_clipboard_log() -> Vec<ClipboardEntry> {
    //read first time
    let first_entries = clipboard::read_log();
    // for entry in &first_entries {
    //     println!("📝 {} @ {}", entry.content, entry.timestamp);
    // }
    return first_entries;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_clipboard_log])
        .setup(|app: &mut tauri::App| {
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                clipboard::start_clipboard_watcher(app_handle);
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
