use image::codecs::jpeg::JpegEncoder;
use image::io::Reader as ImageReader;
use image::{ColorType, DynamicImage, GenericImageView};
use std::fs;
use std::io::Cursor;
use std::path::Path;

#[tauri::command]
pub fn compress_and_adjust_image(
    path: String,
    output_path: String,
    compression: Option<u8>,
) -> Result<(), String> {
    let compression_value = compression.unwrap_or(70);

    // Carica immagine
    let img = ImageReader::open(&path)
        .map_err(|e| e.to_string())?
        .decode()
        .map_err(|e| e.to_string())?;

    // Applica modifiche (es. aumenta luminosità)
    // let img = img.brighten(20);

    // Prepara buffer in memoria
    let mut buffer = Cursor::new(Vec::new());

    // Crea encoder JPEG e scrive con qualità 70
    let mut encoder = JpegEncoder::new_with_quality(&mut buffer, compression_value);
    encoder.encode_image(&img).map_err(|e| e.to_string())?;

    let path = Path::new(&output_path);

    // Crea la cartella se non esiste
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    // Salva su disco
    fs::write(&path, buffer.into_inner()).map_err(|e| e.to_string())?;

    Ok(())
}
