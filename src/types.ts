export type Sound = {
  name?: string;
  path?: string;
};

export type KeyMap = {
  id: string;
  key: number; // {CC}{NOTE}
  sound: Sound;
};

export type MidiBytes = {
  cc: number;
  note: number;
  velocity: number;
};

export type MidiDevice = {
  name: string;
  index: number;
};

export type AudioOutput = {
  name: string;
  id: string;
};
