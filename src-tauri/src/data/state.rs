use std::sync::Mutex;
use midir::MidiInputConnection;
use rodio::{ MixerDeviceSink, Player};
use serde::{Deserialize, Serialize};
use tauri::{App, Manager};
use tauri_plugin_store::StoreExt;

use crate::types::KeyMap;

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(default)]
pub struct SettingsState {
    pub is_speaker_mode: bool,
    pub midi_device: String,
}

pub struct AudioState {
  pub mixer: MixerDeviceSink,
  pub players: Vec<Player>,
}

pub struct AppStateInner {
  pub settings: SettingsState,
  pub audio_state: AudioState,
  pub midi_connection: Option<MidiInputConnection<()>>,
  pub key_map: Option<Vec<KeyMap>>,
}

pub type AppState = Mutex<AppStateInner>;

// ONLY for Debug !!!!
impl Default for SettingsState {
  fn default() -> Self {
    Self {
      is_speaker_mode: true,
      midi_device: String::default(),
    }
  }
}

pub fn setup_state(app: &mut App) -> std::result::Result<(), Box<dyn std::error::Error>> {
  let store = app.store("store.json")?;
  let settings = match store.get("settings") {
    Some(value) => {
      serde_json::from_value::<SettingsState>(value.clone())?
    }
    None => {
      let default_settings = SettingsState::default();

      store.set("settings", serde_json::to_value(&default_settings)?);
      store.save()?;

      default_settings
    },
  };

  let keymap = match store.get("keyMap") {
    Some(value) => {
      serde_json::from_value::<Vec<KeyMap>>(value.clone())?
    }
    None => {
      Vec::new()
    }
  };

  let mixer = rodio::DeviceSinkBuilder::open_default_sink()?;
  let audio_state = AudioState {
    mixer,
    players: Vec::new(),
  };

  let state = AppStateInner {
    settings,
    audio_state,
    midi_connection: None,
    key_map: Some(keymap),
  };

  app.manage(AppState::new(state));

  Ok(())
}
