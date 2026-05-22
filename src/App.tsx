import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

import reactLogo from './assets/react.svg';
import './App.css';

type Input = {
  name: string;
  id: string;
};

function App () {
  const [devices, setDevices] = useState<Input[]>([]);

  const list = async () => {
    try {
      const d = await invoke<Input[]>('list_devices');

      setDevices(d);
    } catch (e) {
      console.error('TAURI ERROR:', e);
    }
  };

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank" rel="noreferrer">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <button onClick={list}>list devices</button>

      <ol>
        { devices.map((item, i) => (
          <li key={i}>{ item.name }</li>
        )) }
      </ol>
    </main>
  );
}

export default App;
