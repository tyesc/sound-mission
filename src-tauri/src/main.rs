// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod utils;

fn main() {
    // match utils::listen_inputs() {
    //     Ok(_) => (),
    //     Err(err) => println!("Error: {}", err),
    // }

    sound_mission_lib::run();
}
