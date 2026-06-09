export type Sound = {
  name?: string;
  path?: string;
};

export type KeyMap = {
  id: string;
  key: string; // {kind}:{channel}:{number}
  sound: Sound;
};

export type MidiEvent = {
  channel: number;
  kind: MidiKind;
  number: number;
  value: number;
  pressed: boolean;
};

export enum MidiKind {
  Note,
  ControlChange,
  Other,
}

export type MidiDevice = {
  name: string;
  index: number;
};

export type AudioOutput = {
  name: string;
  id: string;
};
