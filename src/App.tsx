import { useEffect, useState } from 'react';
import reactLogo from './assets/react.svg';
import { invoke } from '@tauri-apps/api/core';
import './App.css';
import { writeText, readText } from '@tauri-apps/plugin-clipboard-manager';
import { listen } from '@tauri-apps/api/event';

type ClipboardEntry = {
  content: string;
  timestamp: string;
};

function App() {
  const [clipBoardList, setClipBoardList] = useState<ClipboardEntry[]>([]);

  useEffect(() => {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

    function getFirstData() {
      invoke('get_clipboard_log').then((data) => {
        setClipBoardList(data as ClipboardEntry[]);
      });
    }

    getFirstData();

    const unlisten = listen<ClipboardEntry[]>('clipboard-changed', (event) => {
      setClipBoardList(event.payload);
    });

    return () => {
      unlisten.then((off) => off());
    };
  }, []);

  return (
    <main className='container'>
      <h1>Welcome to Tauri + React</h1>

      <div style={{ padding: 20 }}>
        <h2>Clipboard log:</h2>
        <ul>
          {clipBoardList.map((entry, idx) => (
            <li key={idx} onClick={() => writeText(entry.content)}>
              <pre>{entry.content}</pre>
              <small>{entry.timestamp}</small>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export default App;
