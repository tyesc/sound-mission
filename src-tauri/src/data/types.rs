use serde::{Deserialize, Serialize};


#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Sound {
  pub name: String,
  pub path: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct KeyMap {
  pub id: String,
  pub key: String,
  pub sound: Sound,
}

#[derive(Serialize, Clone, Debug)]
pub struct Input {
  pub name: String,
  pub index: u32,
}

impl Input {
  pub fn new(index: u32, name: &str) -> Input {
    Input {
      index: index,
      name: name.to_string(),
    }
  }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Output {
  pub id: String,
  pub name: String,
}

impl Output {
  pub fn new(id: &str, name: &str) -> Output {
    Output {
      id: id.to_string(),
      name: name.to_string(),
    }
  }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct MidiEvent {
    pub channel: u8,
    pub kind: MidiKind,
    pub number: u8,
    pub value: u8,
    pub pressed: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum MidiKind {
    Note,
    ControlChange,
    Other,
}
