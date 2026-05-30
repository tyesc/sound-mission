use midir::{Ignore, MidiInput};
use serde::Serialize;
use tauri::{AppHandle, Manager};

use crate::state::AppState;

#[path = "../data/state.rs"]
mod state;
#[path = "../utils.rs"]
mod utils;
#[path = "midi.rs"]
mod midi;

#[derive(Serialize, Clone, Debug)]
pub struct Input {
    name: String,
    index: u32,
}

impl Input {
    fn new(index: u32, name: &str) -> Input {
        Input {
            index: index,
            name: name.to_string(),
        }
    }
}

#[tauri::command]
pub fn list_devices() -> Result<Vec<Input>, String> {
    let mut midi_in = MidiInput::new("midir test input").map_err(|e| e.to_string())?;
    midi_in.ignore(Ignore::None);

    let mut devices: Vec<Input> = Vec::new();

    for (i, p) in midi_in.ports().iter().enumerate() {
        let port_name = match midi_in.port_name(p) {
            Ok(name) => name,
            Err(_) => String::from("No Name"),
        };

        devices.push(Input::new(i as u32, &port_name));
    }

    return Ok(devices);
}

#[tauri::command]
pub fn on_device_selected(app: AppHandle, index: u32) -> Result<(), String> {
    let app_state = app.state::<AppState>();

    println!("ID Recieved {}", index);

    let midi_connection = midi::crate_midi_connection(app.clone(), index).map_err(|err| err.to_string())?;

    let mut s = app_state.lock().unwrap();
    s.midi_connection = Some(midi_connection);

    return Ok(());
}

#[derive(Serialize, Clone, Debug)]
pub struct Output {
    id: String,
    name: String,
}

impl Output {
    fn new(id: &str, name: &str) -> Output {
        Output {
            id: id.to_string(),
            name: name.to_string(),
        }
    }
}

#[tauri::command]
pub fn list_outputs_audio() -> Result<Vec<Output>, String> {
    let mut outputs: Vec<Output> = Vec::new();

    // TODO: need to test and check if those outputs
    // are really usable, i'll use default in the meantime
    // let host = cpal::default_host();
    // let devices = host.output_devices().map_err(|e| e.to_string())?;

    // for device in devices {
    //     if !utils::output_has_config(&device) {
    //         continue;
    //     }

    //     if !device.default_output_config().is_ok() {
    //         continue;
    //     }

    //     if !utils::output_is_steamable(&device) {
    //         continue;
    //     }

    //     let id = device.id().map_err(|e| e.to_string())?;
    //     let name = device.description().map_err(|e| e.to_string())?;

    //     if utils::is_likely_virtual(&name.name()) {
    //         continue;
    //     }

    //     println!("Output {}", name.name());
    //     outputs.push(Output::new(&id.to_string(), name.name()));
    // }

    return Ok(outputs);
}
