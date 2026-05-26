import { createContext } from 'react';

import { KeyMap } from '../types';

export interface AppContextObject {
  keyMap?: KeyMap[];
};

export const AppContext = createContext<AppContextObject>({});
