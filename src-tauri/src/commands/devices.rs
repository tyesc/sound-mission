use midir::{Ignore, MidiInput, MidiInputConnection};
use tauri::{AppHandle, Emitter, Manager};

use crate::{state::AppState, types::{Input, MidiBytes, Output}};

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

  let midi_connection = crate_midi_connection(app.clone(), index).map_err(|err| err.to_string())?;

  let mut s = app_state.lock().unwrap();
  s.midi_connection = Some(midi_connection);

  return Ok(());
}

fn crate_midi_connection(app: AppHandle, midi_input: u32) -> Result<MidiInputConnection<()>, String> {
  let mut midi_in = MidiInput::new("midir reading input").map_err(|err| err.to_string())?;
  midi_in.ignore(Ignore::None);

  let in_ports = midi_in.ports();
  let in_port = &in_ports[midi_input as usize];

  println!("\nOpening connection");
  let in_port_name = midi_in.port_name(in_port).map_err(|err| err.to_string())?;
  println!("in_port_name: {}", in_port_name);

  // _conn_in needs to be a named parameter, because it needs to be kept alive until the end of the scope
  let conn_in = midi_in
    .connect(
      in_port,
      "midir-read-input",
      move |_, message, _| {
        let msg = MidiBytes {
          cc: message[0],
          note: message[1],
          velocity: message[2],
        };

        app.emit("on_key_pressed", msg).unwrap();
      },
      (),
    )
    .map_err(|err| err.to_string())?;

  return Ok(conn_in);
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
