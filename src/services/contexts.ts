import { createContext } from 'react';

import { KeyMap } from '../types';

export interface AppContextObject {
  keyMap?: KeyMap[];
  setKeyMap?: (keyMap?: KeyMap[]) => void;
  saveKey?: (kmap: KeyMap) => void;
};

export const AppContext = createContext<AppContextObject>({});
