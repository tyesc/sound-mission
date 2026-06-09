use std::process::Command;
use std::io;

#[cfg(target_os = "linux")]
pub fn setup_virtual_input() -> io::Result<()> {
    let output = Command::new("pactl")
        .args(["list", "short", "modules"])
        .output()?;
    let modules = String::from_utf8_lossy(&output.stdout);

    if modules.contains("SoundmissionMainSink") {
        println!("SoundmissionSink already configured.");
        return Ok(());
    }

    // Création du sink virtuel
    let status = Command::new("pactl")
        .args([
            "load-module",
            "module-null-sink",
            "sink_name=SoundmissionMainSink",
            "sink_properties=device.description=Soundmission Microphone",
        ])
        .status()?;

    if !status.success() {
        eprintln!("Failed to create SoundmissionSink");
        return Ok(());
    }

    // Création de la source virtuelle
    let status = Command::new("pactl")
        .args([
            "load-module",
            "module-remap-source",
            "source_name=SoundmissionMicrophoneSink",
            "master=SoundmissionMainSink.monitor",
            "source_properties=device.description=Soundmission Microphone",
        ])
        .status()?;

    if !status.success() {
        eprintln!("Failed to create remap source");
    }

    Ok(())
}

#[cfg(target_os = "windows")]
pub fn setup_virtual_input() {

}

#[cfg(target_os = "macos")]
pub fn setup_virtual_input() {

}
