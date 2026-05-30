use tauri::{App, AppHandle, Listener, Manager};

use crate::{state::AppState, utils::play_through_output};

#[path = "commands/devices.rs"]
mod devices;
#[path = "commands/config.rs"]
mod config;
#[path = "commands/play.rs"]
mod play;
#[path = "data/types.rs"]
mod types;
#[path = "data/state.rs"]
mod state;
#[path = "utils.rs"]
mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_store::Builder::new().build())
    .plugin(tauri_plugin_log::Builder::new().build())
    .plugin(tauri_plugin_opener::init())
    .setup(|app| {
      let handle = app.handle().clone();

      state::setup_state(app)?;
      setup_listeners(app, handle)?;

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      devices::on_device_selected,
      devices::list_devices,
      devices::list_outputs_audio,
      config::save_keymap,
      config::get_stored_value,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

pub fn setup_listeners(app: &mut App, handle: AppHandle) -> std::result::Result<(), Box<dyn std::error::Error>> {
  app.listen("on_key_pressed", move |event| {
    let _state = handle.state::<AppState>();
    let payload = event.payload();

    if let Ok(msg) = serde_json::from_str::<types::MidiBytes>(payload) {
      let state = _state.lock().unwrap();

      println!("cc={}, note={}, velocity={}", msg.cc, msg.note, msg.velocity);
      let key: u32 = format!("{}{}", msg.cc, msg.note).parse().unwrap();

      let key_match = state.key_map.as_ref().unwrap().iter().find(|&x| x.key == key);

      match key_match {
        Some(value) => {
          play_through_output(&value.sound.path).expect("Can't play song");
        }
        None => {
          println!("NOPE")
        }
      }
    }
  });

  Ok(())
}
