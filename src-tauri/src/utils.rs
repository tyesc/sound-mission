// use std::error::Error;
// use std::io::{stdin, stdout, Write};

// use midir::{Ignore, MidiInput};
// use rodio::{DeviceTrait, cpal::{self, traits::HostTrait}};


// pub fn output_has_config(device: &cpal::Device) -> bool {
//     let has_configs = device.supported_output_configs()
//         .map(|mut c| c.next().is_some())
//         .unwrap_or(false);

//     return has_configs;
// }

// pub fn output_is_steamable(device: &cpal::Device) -> bool {
//     let config = match device.default_output_config() {
//         Ok(c) => c.into(),
//         Err(_) => return false,
//     };

//     let stream_result = device.build_output_stream(
//         &config,
//         |_data: &mut [f32], _| {},
//         |_err| {},
//         None,
//     );

//     return stream_result.is_ok();
// }

// pub fn is_likely_virtual(name: &str) -> bool {
//     let n = name.to_lowercase();

//     n.contains("virtual")
//         || n.contains("voicemeeter")
//         || n.contains("obs")
//         || n.contains("nvidia")
//         || n.contains("amd hdmi")
//         || n.contains("spdif")
// }
