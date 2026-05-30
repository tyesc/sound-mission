use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;

use crate::{state::AppState, types::KeyMap};

#[tauri::command]
pub fn save_keymap(app: AppHandle, kmap: Vec<KeyMap>) -> Result<(), String> {
  let state = app.state::<AppState>();
  let mut state = state.lock().unwrap();
  let store = app.store("store.json").map_err(|err| err.to_string())?;
  let key_map = serde_json::to_value(&kmap).map_err(|err| err.to_string())?;

  println!("KMAP {:?}", kmap);
  store.set("keyMap", key_map);
  store.save().map_err(|err| err.to_string())?;

  state.key_map = Some(kmap);

  store.close_resource();

  return Ok(());
}

#[tauri::command]
pub fn get_stored_value(app: AppHandle, key: String) -> Result<Vec<KeyMap>, String> {
  let store = app.store("store.json").map_err(|err| err.to_string())?;
  let value = store.get(key).ok_or("Key not found")?;

  store.close_resource();

  let res: Vec<KeyMap> = serde_json::from_value(value.clone()).map_err(|err| err.to_string())?;

  return Ok(res);
}
