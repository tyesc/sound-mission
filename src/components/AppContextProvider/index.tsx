import { ComponentPropsWithoutRef, useCallback, useEffect, useReducer } from 'react';
import { mockState } from '@junipero/react';
import { invoke } from '@tauri-apps/api/core';

import { AppContext } from '../../services/contexts';
import { KeyMap } from '../../types';

export interface AppContextProps extends ComponentPropsWithoutRef<any> { };

export interface AppContextState {
  keyMap: KeyMap[];
};

const AppContextProvider = ({ children }: AppContextProps) => {
  const [state, dispatch] = useReducer(mockState<AppContextProps>, {
    keyMap: [],
  });

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

  const saveKey = useCallback((kmap: KeyMap) =>{
    const exists = state.keyMap.findIndex((e: KeyMap) => e.id === kmap.id);

    if (exists == null || exists == undefined) {
      return;
    }

    const newMap = state.keyMap.toSpliced(exists, exists > -1 ? 1 : 0, kmap);
    setKeyMap(newMap);
  }, [setKeyMap, state.keyMap]);

  const getValue = useCallback(() => ({
    keyMap: state.keyMap,
    setKeyMap,
    saveKey,
  }), [
    state.keyMap,
    setKeyMap,
    saveKey,
  ]);

  return (
    <AppContext.Provider value={getValue()}>
      { children }
    </AppContext.Provider>
  );
};

export default AppContextProvider;
