use tauri::{App};

#[path = "commands/devices.rs"]
mod devices;
#[path = "commands/midi.rs"]
mod midi;
#[path = "commands/config.rs"]
mod config;
#[path = "commands/play.rs"]
mod play;
#[path = "data/state.rs"]
mod state;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            setup_natif_listeners(app)?;
            state::setup_state(app)?;

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

fn setup_natif_listeners(app: &mut App) -> std::result::Result<(), Box<dyn std::error::Error>> {
    let app_handle = app.handle().clone();

    std::thread::spawn(|| match midi::listen_inputs(app_handle) {
        Ok(_) => (),
        Err(err) => println!("Error: {}", err),
    });

    Ok(())
}
