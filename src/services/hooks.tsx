import { useContext } from 'react';

import { AppContext } from './contexts';

export const useApp = () => useContext(AppContext);
