import { ComponentPropsWithoutRef, useCallback, useEffect, useReducer } from 'react';
import { mockState } from '@junipero/react';
import { invoke } from '@tauri-apps/api/core';

import { AppContext } from '../../services/contexts';
import { KeyMap, MidiDevice, AudioOutput } from '../../types';

export interface AppContextProps extends ComponentPropsWithoutRef<any> { };

export interface AppContextState {
  keyMap: KeyMap[];
  midiDevices: MidiDevice[];
  audioOutputs: AudioOutput[];
};

const AppContextProvider = ({ children }: AppContextProps) => {
  const [state, dispatch] = useReducer(mockState<AppContextProps>, {
    keyMap: [],
    midiDevices: [],
    audioOutputs: [],
  });

  const listMidi = async () => {
    try {
      const midiDevices = await invoke<MidiDevice[]>('list_devices');

      dispatch({ midiDevices });
    } catch (e) {
      console.error('TAURI ERROR:', e);
    }
  };

  const listOutput = async () => {
    try {
      const audioOutputs = await invoke<AudioOutput[]>('list_outputs_audio');

      dispatch({ audioOutputs });
    } catch (e) {
      console.error('TAURI ERROR:', e);
    }
  };

  useEffect(() => {
    listMidi();
    listOutput();
  }, []);

  const getStoredKeyMap = async () => {
    try {
      const res: KeyMap[] = await invoke('get_stored_value', { key: 'keyMap' });

      dispatch({ keyMap: res });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getStoredKeyMap();
  }, []);

  const setKeyMap = useCallback((keyMap?: KeyMap[]) => {
    if (!keyMap) {
      return;
    }

    dispatch({ keyMap });
  }, []);

  const getValue = useCallback(() => ({
    keyMap: state.keyMap,
    midiDevices: state.midiDevices,
    audioOutputs: state.audioOutputs,
    setKeyMap,
  }), [
    state.keyMap,
    state.midiDevices,
    state.audioOutputs,
    setKeyMap,
  ]);

  return (
    <AppContext.Provider value={getValue()}>
      { children }
    </AppContext.Provider>
  );
};

export default AppContextProvider;
