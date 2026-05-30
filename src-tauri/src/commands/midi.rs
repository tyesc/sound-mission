use midir::{Ignore, MidiInput, MidiInputConnection};
use tauri::{AppHandle, Emitter};


pub fn crate_midi_connection(app: AppHandle, midi_input: u32) -> Result<MidiInputConnection<()>, String> {
    let mut midi_in = MidiInput::new("midir reading input").map_err(|err| err.to_string())?;
    midi_in.ignore(Ignore::None);

    let in_ports = midi_in.ports();
    let in_port = &in_ports[midi_input as usize];

    println!("\nOpening connection");
    let in_port_name = midi_in.port_name(in_port).map_err(|err| err.to_string())?;
    println!("in_port_name: {}", in_port_name);

    // _conn_in needs to be a named parameter, because it needs to be kept alive until the end of the scope
    let conn_in = midi_in
        .connect(
            in_port,
            "midir-read-input",
            move |stamp, message, _| {
                println!("{}: {:?} (len = {})", stamp, message, message.len());
                let msg = format!("{:?}", message).to_string();
                app.emit("on_key_pressed", msg).unwrap();
            },
            (),
        )
        .map_err(|err| err.to_string())?;

    return Ok(conn_in);
}
