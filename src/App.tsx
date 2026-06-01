import { Theme } from '@radix-ui/themes';

import AppRoutes from './components/AppRoutes';
import AppContextProvider from './components/AppContextProvider';

const App = () => {
  return (
    <Theme appearance="inherit" hasBackground={false}>
      <AppContextProvider>
        <AppRoutes />
      </AppContextProvider>
    </Theme>
  );
};

export default App;
