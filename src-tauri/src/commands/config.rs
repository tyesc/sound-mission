use serde_json::json;
use tauri::{AppHandle};
use tauri_plugin_store::StoreExt;
use serde::{Deserialize, Serialize};


#[derive(Serialize, Deserialize, Clone, Debug)]
struct Sound {
    name: String,
    path: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
struct Key {
    id: i32,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct KeyMap {
    index: u32,
    key: Key,
    sound: Sound
}

#[tauri::command]
pub fn save_keymap(app: AppHandle, kmap: Vec<KeyMap>) -> Result<(), String> {
    let store = app.store("store.json").map_err(|err| err.to_string())?;

    println!("KMAP {:?}", kmap);
    store.set("keyMap", json!({ "value": kmap }));
    store.save().map_err(|err| err.to_string())?;

    store.close_resource();

    return Ok(());
}

#[tauri::command]
pub fn get_stored_value(app: AppHandle, key: String) -> Result<Vec<KeyMap>, String> {
    let store = app.store("store.json").map_err(|err| err.to_string())?;
    let value = store.get(key).ok_or("Key not found")?;

    store.close_resource();

    let final_val = value.get("value").ok_or("Key not found")?;
    let res: Vec<KeyMap> = serde_json::from_value(final_val.clone()).map_err(|err| err.to_string())?;

    return Ok(res);
}
