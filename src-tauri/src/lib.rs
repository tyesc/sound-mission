#[path = "commands/devices.rs"]
mod devices;
#[path = "commands/midi.rs"]
mod midi;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_handle = app.handle().clone();

            std::thread::spawn(|| match midi::listen_inputs(app_handle) {
                Ok(_) => (),
                Err(err) => println!("Error: {}", err),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            devices::on_device_selected,
            devices::list_devices,
            devices::list_outputs_audio,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
