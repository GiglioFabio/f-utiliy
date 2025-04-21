use dirs_next::data_dir;
use std::path::PathBuf;

pub fn get_app_base_path() -> PathBuf {
    let mut base_dir =
        data_dir().expect("Non è stato possibile trovare la cartella dei dati utente");
    base_dir.push("f_utilty_data");
    std::fs::create_dir_all(&base_dir).ok();
    return base_dir;
}
