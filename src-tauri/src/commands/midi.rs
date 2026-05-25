use midir::{Ignore, MidiInput};
use tauri::{AppHandle, Emitter};
// use thiserror::Error;

// #[derive(Error, Debug)]
// enum ListenError {
//     #[error(transparent)]
//     Io(#[from] std::io::Error),

//     #[error(transparent)]
//     Anyhow(#[from] anyhow::Error),

//     #[error(transparent)]
//     Midir(#[from] midir::InitError),
// }

// // we must manually implement serde::Serialize
// impl serde::Serialize for ListenError {
//   fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
//   where
//     S: serde::ser::Serializer,
//   {
//     serializer.serialize_str(self.to_string().as_ref())
//   }
// }

#[tauri::command]
pub fn listen_inputs(app: AppHandle) -> Result<(), String> {
    let mut midi_in = MidiInput::new("midir reading input").map_err(|err| err.to_string())?;
    midi_in.ignore(Ignore::None);

    let in_ports = midi_in.ports();
    let in_port = &in_ports[1];

    println!("\nOpening connection");
    let in_port_name = midi_in.port_name(in_port).map_err(|err| err.to_string())?;
    println!("in_port_name: {}", in_port_name);

    // _conn_in needs to be a named parameter, because it needs to be kept alive until the end of the scope
    let _conn_in = midi_in
        .connect(
            in_port,
            "midir-read-input",
            move |stamp, message, _| {
                let msg = format!("{}: {:?} (len = {})", stamp, message, message.len()).to_string();
                println!("{}", msg);
                app.emit("on_key_pressed", msg).unwrap();
            },
            (),
        )
        .map_err(|err| err.to_string())?; // TODO: clean all this kind of error handling

    loop {
        std::thread::sleep(std::time::Duration::from_secs(1));
    }
}
