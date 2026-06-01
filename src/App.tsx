import { Theme } from '@radix-ui/themes';

import AppRoutes from './components/AppRoutes';
import AppContextProvider from './components/AppContextProvider';

const App = () => {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <Theme appearance={isDark ? 'dark' : 'light'} hasBackground={false}>
      <AppContextProvider>
        <AppRoutes />
      </AppContextProvider>
    </Theme>
  );
};

export default App;
