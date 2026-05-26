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

  const getValue = useCallback(() => ({
    keyMap: state.keyMap,
  }), [
    state.keyMap,
  ]);

  return (
    <AppContext.Provider value={getValue()}>
      { children }
    </AppContext.Provider>
  );
};

export default AppContextProvider;
