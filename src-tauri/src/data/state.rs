use std::sync::Mutex;
use midir::MidiInputConnection;
use serde::{Deserialize, Serialize};
use tauri::{App, Manager};
use tauri_plugin_store::StoreExt;


#[derive(Default, Serialize, Deserialize, Clone, Debug)]
#[serde(default)]
pub struct Settings {
    pub is_speaker_mode: bool,
    pub midi_device: String,
}

pub struct AppStateInner {
    pub settings: Settings,
    pub midi_connection:Option<MidiInputConnection<()>>
}

pub type AppState = Mutex<AppStateInner>;

pub fn setup_state(app: &mut App) -> std::result::Result<(), Box<dyn std::error::Error>> {
    let store = app.store("store.json")?;
    let settings = match store.get("settings") {
        Some(value) => {
            serde_json::from_value::<Settings>(value.clone())?
        }
        None => {
            let default_settings = Settings::default();

            store.set("settings", serde_json::to_value(&default_settings)?);
            store.save()?;

            default_settings
        },
    };

    let state = AppStateInner {
        settings,
        midi_connection: None,
    };

    app.manage(AppState::new(state));

    Ok(())
}
