use serde::Serialize;

use midir::{Ignore, MidiInput};


// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Serialize, Clone, Debug)]
struct Input {
    id: String,
    name: String,
}

impl Input {
    fn new(id: &str, name: &str) -> Input {
        Input {
            id: id.to_string(),
            name: name.to_string(),
        }
    }
}

#[tauri::command]
fn list_devices() -> Result<Vec<Input>, String> {
    let mut midi_in = MidiInput::new("midir test input").map_err(|e| e.to_string())?;
    midi_in.ignore(Ignore::None);

    let mut devices: Vec<Input> = Vec::new();

    for (_, p) in midi_in.ports().iter().enumerate() {
        let port_name = match midi_in.port_name(p) {
            Ok(name) => name,
            Err(_) => String::from("No Name"),
        };

        devices.push(Input::new(&p.id(), &port_name));
    }

    return Ok(devices);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, list_devices])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
