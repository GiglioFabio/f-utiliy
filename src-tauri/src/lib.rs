#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::menu::MenuItem;
use tauri::menu::{IsMenuItem, MenuBuilder, MenuItemBuilder, SubmenuBuilder};
use tauri::{AppHandle, Listener, Manager};
mod utils {
    pub mod paths;
}
mod services {
    pub mod clipboard;
    pub mod drawing_manager;
    pub mod filemanager;
    pub mod images_utils;
}
use services::clipboard::get_clipboard_log;
use services::drawing_manager::{
    clear_single_drawing_file, load_drawing_files, read_data_single_drawing_file,
    read_json_drawing_file, save_drawing_data, save_drawing_to_file,
};
use services::filemanager::{
    add_recent_file, clear_single_recent_file, load_recent_files, open_file, reveal_in_folder,
};
use services::images_utils::compress_and_adjust_image;

const MAIN_WINDOW_NAME: &str = "main";
const WINDOW_VISIBILITY_MENU_ITEM_ID: &str = "visibility";
const WINDOW_QUIT_MENU_ITEM_ID: &str = "quit";
const WINDOW_VISIBILITY_TITLE: &str = "Toggle";
const WINDOW_QUIT_TITLE: &str = "Quit";

fn toggle_app_visibility(app: &AppHandle) {
    if let Some(window) = app.get_webview_window(MAIN_WINDOW_NAME) {
        if window.is_visible().unwrap_or(false) {
            println!("Hide main window");
            let _ = window.hide();
        } else {
            println!("Show main window");
            let _ = window.show();
            let _ = window.set_focus();
        }
    } else {
        println!("{MAIN_WINDOW_NAME} window not found!");
    }
}

#[tauri::command]
fn open_accessibility_settings() {
    std::process::Command::new("open")
        .arg("x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility")
        .spawn()
        .expect("failed to open System Settings");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        // .plugin(tauri_plugin_global_shortcut::Builder::new().build()) //https://github.com/tauri-apps/plugins-workspace/issues/2540
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_clipboard_log,
            open_file,
            reveal_in_folder,
            add_recent_file,
            load_recent_files,
            clear_single_recent_file,
            open_accessibility_settings,
            compress_and_adjust_image,
            load_drawing_files,
            clear_single_drawing_file,
            save_drawing_data,
            read_data_single_drawing_file,
            save_drawing_to_file,
            read_json_drawing_file
        ])
        .setup(|app| {
            // 🔔 Tray Icon
            update_tray_menu(app.handle())?;

            let app_handle1 = app.handle().clone();
            // 🔔 Listener per quando l'utente clicca sull’icona nel Dock (o sulla taskbar in Windows)
            app.listen("tauri://activate", move |_| {
                println!("{MAIN_WINDOW_NAME} Dock active!");
                toggle_app_visibility(&app_handle1);
            });

            let app_handle = app.handle().clone();
            // Avvia clipboard watcher in un task async
            tauri::async_runtime::spawn(async move {
                services::clipboard::start_clipboard_watcher(app_handle);
            });

            // Autostart macOS
            // TODO sembra non andare
            #[cfg(desktop)]
            {
                use tauri_plugin_autostart::MacosLauncher;
                use tauri_plugin_autostart::ManagerExt;

                let _ = app.handle().plugin(tauri_plugin_autostart::init(
                    MacosLauncher::LaunchAgent,
                    Some(vec!["--flag1", "--flag2"]),
                ));

                // Get the autostart manager
                let autostart_manager = app.autolaunch();
                // Enable autostart
                let _ = autostart_manager.enable();
                // Check enable state
                println!(
                    "registered for autostart? {}",
                    autostart_manager.is_enabled().unwrap()
                );
                // Disable autostart
                let _ = autostart_manager.disable();
            }

            // Shortcut listener
            #[cfg(desktop)]
            {
                use tauri_plugin_global_shortcut::{
                    Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState,
                };
                let paste_without_formatting =
                    Shortcut::new(Some(Modifiers::SHIFT | Modifiers::SUPER), Code::KeyV);
                app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(move |_app, shortcut, event| {
                            println!("{:?}", shortcut);
                            if shortcut == &paste_without_formatting {
                                match event.state() {
                                    ShortcutState::Pressed => {
                                        println!("Cmd-SHIFT-V Pressed!");
                                    }
                                    ShortcutState::Released => {
                                        println!("Cmd-SHIFT-V Released!");
                                        services::clipboard::clear_format_current_clipboard();
                                        services::clipboard::simulate_cmd_v();
                                    }
                                }
                            }
                        })
                        .build(),
                )?;

                app.global_shortcut().register(paste_without_formatting)?;
            }
            Ok(())
        })
        .on_window_event(|_window, event| match event {
            tauri::WindowEvent::Focused(focused) => {
                if !focused {
                    println!("window lost focus");
                } else {
                    println!("window gained focus");
                }
            }

            // tauri::WindowEvent::CloseRequested { api, .. } => {
            //     _window.hide().unwrap();
            //     api.prevent_close();
            // }
            tauri::WindowEvent::CloseRequested { api, .. } => {
                #[cfg(not(target_os = "macos"))]
                {
                    event.window().hide().unwrap();
                }

                #[cfg(target_os = "macos")]
                {
                    tauri::AppHandle::hide(&_window.app_handle()).unwrap();
                }
                api.prevent_close();
            }

            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn update_tray_menu(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // Set up system tray
    let toggle_visibility =
        MenuItemBuilder::with_id(WINDOW_VISIBILITY_MENU_ITEM_ID, WINDOW_VISIBILITY_TITLE)
            .build(app)?;
    let quit = MenuItemBuilder::with_id(WINDOW_QUIT_MENU_ITEM_ID, WINDOW_QUIT_TITLE).build(app)?;

    // Crea i sotto-elementi
    let clipboard_items: Vec<MenuItem<_>> = get_clipboard_log()
        .iter()
        .take(20)
        .enumerate()
        .map(|(i, entry)| {
            MenuItemBuilder::with_id(&format!("clipboard_{}", i), &entry.content).build(app)
        })
        .collect::<Result<_, _>>()?;
    let clipboard_refs: Vec<&dyn IsMenuItem<_>> =
        clipboard_items.iter().map(|item| item as _).collect();
    let clipboard_submenu = SubmenuBuilder::new(app, "Clipboard")
        .items(&clipboard_refs)
        .build()?;
    let recent_items: Vec<MenuItem<_>> = load_recent_files()
        .iter()
        .take(20)
        .enumerate()
        .map(|(i, entry)| {
            MenuItemBuilder::with_id(&format!("recent_{}", i), &entry.name).build(app)
        })
        .collect::<Result<_, _>>()?;
    let recent_refs: Vec<&dyn IsMenuItem<_>> = recent_items.iter().map(|item| item as _).collect();
    let recent_submenu = SubmenuBuilder::new(app, "Recent")
        .items(&recent_refs)
        .build()?;

    let menu = MenuBuilder::new(app)
        .items(&[
            &clipboard_submenu,
            &recent_submenu,
            &toggle_visibility,
            &quit,
        ])
        .build()?;

    if let Some(tray_icon) = app.tray_by_id(MAIN_WINDOW_NAME) {
        tray_icon.set_menu(Some(menu)).unwrap();
        tray_icon.on_menu_event(move |app, event| match event.id().as_ref() {
            WINDOW_VISIBILITY_MENU_ITEM_ID => toggle_app_visibility(app),
            WINDOW_QUIT_MENU_ITEM_ID => {
                println!("Exiting the app...");

                app.cleanup_before_exit();
                std::process::exit(0);
            }
            id if id.starts_with("clipboard_") => {
                let index = id.strip_prefix("clipboard_").unwrap();
                let clipboard_items = get_clipboard_log();
                if let Some(item) = clipboard_items.get(index.parse::<usize>().unwrap()) {
                    println!("Clipboard item clicked: {}", item.content);
                    services::clipboard::set_clipboard_text(&item.content);
                }
            }
            id if id.starts_with("recent_") => {
                let index = id.strip_prefix("recent_").unwrap();
                let recent_items = load_recent_files();
                if let Some(item) = recent_items.get(index.parse::<usize>().unwrap()) {
                    println!("Recent item clicked: {}", item.name);
                    let _ = open_file(item.path.clone());
                }
            }
            id => println!("Unknown tray event id: {}", id),
        });
    } else {
        println!("Cannot find the 'main' tray icon :(");
    }

    Ok(())
}
