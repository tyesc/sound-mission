import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import App from './App';
import { initConsoleLogger } from './logger';

initConsoleLogger();

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
