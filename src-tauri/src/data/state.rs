use std::sync::Mutex;
use serde::{Deserialize, Serialize};
use tauri::{App, Manager};
use tauri_plugin_store::StoreExt;


#[derive(Default, Serialize, Deserialize, Clone, Debug)]
struct Settings {
    is_speaker_mode: bool,
}

#[derive(Default, Serialize, Deserialize, Clone, Debug)]
pub struct AppStateInner {
    settings: Settings,
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
    };

    app.manage(Mutex::new(state));

    Ok(())
}
