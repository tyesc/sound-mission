use std::{fs, path::Path};

use tauri::{App, AppHandle, Listener, Manager};

use crate::{state::AppState};

#[path = "commands/devices.rs"]
mod devices;
#[path = "commands/config.rs"]
mod config;
#[path = "data/types.rs"]
mod types;
#[path = "data/state.rs"]
mod state;
#[path = "utils.rs"]
mod utils;
#[path = "cable.rs"]
mod cable;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_store::Builder::new().build())
    .plugin(tauri_plugin_log::Builder::new().build())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_opener::init())
    .setup(|app| {
      let handle = app.handle().clone();

      state::setup_state(app)?;
      setup_folders(app)?;
      // let _ = cable::setup_virtual_input();
      setup_listeners(app, handle)?;

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      devices::list_devices,
      devices::on_device_selected,
      devices::list_outputs_audio,
      devices::on_output_selected,
      config::save_keymap,
      config::get_stored_value,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

fn setup_folders(app: &mut App) -> std::result::Result<(), Box<dyn std::error::Error>> {
  let data_dir = app.path().app_data_dir();
  let sounds = Path::new(&data_dir.unwrap()).join("sounds");
  let _ = fs::create_dir(sounds).ok();

  Ok(())
}

pub fn setup_listeners(app: &mut App, handle: AppHandle) -> std::result::Result<(), Box<dyn std::error::Error>> {
  app.listen("on_key_pressed", move |event| {
    let _state = handle.state::<AppState>();
    let payload = event.payload();

    if let Ok(event) = serde_json::from_str::<types::MidiEvent>(payload) {
      let mut state = _state.lock().unwrap();

      state.audio_state.players.retain(|player| !player.empty());


      let key: String = format!("{:?}:{}:{}", event.kind, event.channel, event.number).parse().unwrap();

      let key_match = state.key_map.as_ref().unwrap().iter().find(|&x| x.key == key);

      match key_match {
        Some(value) => {
          let path = value.sound.path.clone();
          let file = std::fs::File::open(&path).expect("Can't open sound file");
          let player = rodio::Player::connect_new(state.audio_state.mixer.mixer());

          player.append(rodio::Decoder::try_from(file).expect("Can't decode sound file"));
          state.audio_state.players.push(player);
        }
        None => {
          println!("NOPE")
        }
      }
    }
  });

  Ok(())
}
