use std::{fs, path::Path};

use serde_json::Value;
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;

use crate::{state::AppState, types::{KeyMap, Sound}};

#[tauri::command]
pub fn save_keymap(app: AppHandle, kmap: Vec<KeyMap>) -> Result<(), String> {
  println!("KMAP {:?}", kmap);

  let data_path = app.path().app_data_dir().unwrap();
  let sounds_path = Path::new(&data_path).join("sounds");
  let state = app.state::<AppState>();
  let mut state = state.lock().unwrap();
  let store = app.store("store.json").map_err(|err| err.to_string())?;

  let final_kmap: Vec<KeyMap> = kmap.iter().map(|e| {
    let sound_path = Path::new(&e.sound.path);
    let dest_path = Path::new(&sounds_path).join(&sound_path.file_name().unwrap());

    match fs::copy(&sound_path, &dest_path) {
        Ok(nb_octets) => println!("{} octets copiés", nb_octets),
        Err(e) => eprintln!("Erreur : {}", e),
    }

    KeyMap {
      id: e.id.clone(),
      key: e.key.clone(),
      sound: Sound {
        name: e.sound.name.clone(),
        path: dest_path.into_os_string().into_string().unwrap(),
      }
    }
  }).collect();

  let key_map = serde_json::to_value(&final_kmap).map_err(|err| err.to_string())?;

  store.set("keyMap", key_map);
  store.save().map_err(|err| err.to_string())?;

  state.key_map = Some(final_kmap.clone());

  store.close_resource();

  Ok(())
}

#[tauri::command]
pub fn get_stored_value(app: AppHandle, key: String) -> Result<Vec<KeyMap>, String> {
  let store = app.store("store.json").map_err(|err| err.to_string())?;
  let value = store.get(key).ok_or("Key not found")?;

  store.close_resource();

  let res: Vec<KeyMap> = serde_json::from_value(value.clone()).map_err(|err| err.to_string())?;

  Ok(res)
}

#[tauri::command]
pub fn remove_all_keymap(app: AppHandle) -> Result<(), String> {
  let data_path = app.path().app_data_dir().unwrap();
  let sounds_path = Path::new(&data_path).join("sounds");
  let state = app.state::<AppState>();
  let mut state = state.lock().unwrap();
  let store = app.store("store.json").map_err(|err| err.to_string())?;

  store.set("keyMap", Value::Array(Vec::new()));
  store.save().map_err(|err| err.to_string())?;

  state.key_map = Some(Vec::new());

  for entree in fs::read_dir(sounds_path).map_err(|err| err.to_string())? {
        let path = entree.map_err(|err| err.to_string())?.path();

        if path.is_dir() {
            fs::remove_dir_all(path).map_err(|err| err.to_string())?;
        } else {
            fs::remove_file(path).map_err(|err| err.to_string())?;
        }
    }

  Ok(())
}
