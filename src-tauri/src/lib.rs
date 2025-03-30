#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use clipboard::ClipboardEntry;
use tauri::menu::{MenuBuilder, MenuItemBuilder};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{TrayIcon, TrayIconBuilder, TrayIconEvent},
    WebviewWindow, WindowEvent,
};
use tauri::{AppHandle, Listener, Manager};
mod clipboard;

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
        .setup(|app| {
            // 🔔 Tray Icon con click per riaprire la finestra
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_i])?;

            let tray = TrayIconBuilder::new()
                .menu(&menu)
                .menu_on_left_click(true)
                .show_menu_on_left_click(true)
                .build(app)?;

            // Set up system tray
            let toggle_visibility =
                MenuItemBuilder::with_id(WINDOW_VISIBILITY_MENU_ITEM_ID, WINDOW_VISIBILITY_TITLE)
                    .build(app)?;
            let quit =
                MenuItemBuilder::with_id(WINDOW_QUIT_MENU_ITEM_ID, WINDOW_QUIT_TITLE).build(app)?;

            let menu = MenuBuilder::new(app)
                .items(&[&toggle_visibility, &quit])
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
                    event_id => println!("Unknown tray event id"),
                });
            } else {
                println!("Cannot find the 'main' tray icon :(");
            }

            let app_handle1 = app.handle().clone();
            // 🔔 Listener per quando l'utente clicca sull’icona nel Dock (o sulla taskbar in Windows)
            app.listen("tauri://activate", move |_| {
                println!("{MAIN_WINDOW_NAME} Dock active!");
                toggle_app_visibility(&app_handle1);
            });

            let app_handle = app.handle().clone();
            // Avvia clipboard watcher in un task async
            tauri::async_runtime::spawn(async move {
                clipboard::start_clipboard_watcher(app_handle);
            });

            // Autostart macOS
            #[cfg(desktop)]
            {
                use tauri_plugin_autostart::MacosLauncher;
                use tauri_plugin_autostart::ManagerExt;

                let _ = app.handle().plugin(tauri_plugin_autostart::init(
                    MacosLauncher::LaunchAgent,
                    Some(vec!["--flag1", "--flag2"]),
                ));

                let autostart_manager = app.autolaunch();

                let _ = autostart_manager.enable();

                println!(
                    "registered for autostart? {}",
                    autostart_manager.is_enabled().unwrap_or(false)
                );

                let _ = autostart_manager.disable();
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
