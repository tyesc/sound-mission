import { createContext } from 'react';

import { AudioOutput, KeyMap, MidiDevice } from '../types';

export interface AppContextObject {
  keyMap: KeyMap[];
  midiDevices: MidiDevice[];
  audioOutputs: AudioOutput[];
  setKeyMap: (keyMap: KeyMap[]) => void;
};

export const AppContext = createContext<AppContextObject>({
  keyMap: [],
  midiDevices: [],
  audioOutputs: [],
  setKeyMap: () => {},
});
