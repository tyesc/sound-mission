export type Key = {
  id: number;
};

export type Sound = {
  name: string;
  path: string;
};

export type KeyMap = {
  index: number;
  key: Key;
  sound: Sound;
};
