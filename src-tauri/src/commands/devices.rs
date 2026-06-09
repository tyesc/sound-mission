use cpal::traits::HostTrait;
use midir::{Ignore, MidiInput, MidiInputConnection};
use rodio::DeviceTrait;
use tauri::{AppHandle, Emitter, Manager};

use crate::{
  state::AppState,
  types::{Input, MidiBytes, Output},
  utils::{is_likely_virtual, output_has_config, output_is_steamable},
};

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
        println!("{:?}", message);

        let msg = match message.iter().count() {
            3 => MidiBytes {
              cc: message[0],
              note: message[1],
              velocity: message[2],
            },
            2 => MidiBytes {
              cc: message[0],
              note: message[1],
              velocity: 0,
            },
            _ => MidiBytes {
              cc: 0,
              note: 0,
              velocity: 0,
            }
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
  // are really usable
  let host = cpal::default_host();
  let devices = host.output_devices().map_err(|e| e.to_string())?;

  for device in devices {
      if !output_has_config(&device) {
          continue;
      }

      if !device.default_output_config().is_ok() {
          continue;
      }

      if !output_is_steamable(&device) {
          continue;
      }

      let id = device.id().unwrap().1;
      let name = device.description().map_err(|e| e.to_string())?;

      if is_likely_virtual(&name.name()) {
          continue;
      }

      outputs.push(Output::new(&id.to_string(), name.name()));
  }

  return Ok(outputs);
}

#[tauri::command]
pub fn on_output_selected(app: AppHandle, output: Output) -> Result<(), String> {
  let app_state = app.state::<AppState>();

  let host = cpal::default_host();
  let mut devices = host.output_devices().map_err(|e| e.to_string())?;

  let device: rodio::Device = devices.find(move |e| {
    let eq= e.id().unwrap().1;
    let id = &output.id;

    eq == *id
  }).expect("Cannot find the output");

  let builder = rodio::DeviceSinkBuilder::from_device(device).map_err(|e| e.to_string())?;
  let mixer = builder.open_sink_or_fallback().map_err(|e| e.to_string())?;

  let mut s = app_state.lock().unwrap();
  s.audio_state.mixer = mixer;

  return Ok(());
}
