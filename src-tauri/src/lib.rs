use tauri::{App, Listener, Manager};

use crate::state::AppState;

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
      state::setup_state(app)?;
      setup_listeners(app)?;

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

pub fn setup_listeners(app: &mut App) -> std::result::Result<(), Box<dyn std::error::Error>> {
  let _state = app.state::<AppState>();
  let state = _state.lock().unwrap();

  app.listen("on_key_pressed", |event| {
    let payload = event.payload();

    if let Ok(msg) = serde_json::from_str::<types::MidiBytes>(payload) {
      println!("cc={}, note={}, velocity={}", msg.cc, msg.note, msg.velocity);
    }
  });

  Ok(())
}
