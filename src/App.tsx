import { Theme } from '@radix-ui/themes';

import AppRoutes from './components/AppRoutes';

const App = () => {
  return (
    <Theme hasBackground={false}>
      <AppRoutes />
    </Theme>
  );
};

export default App;
