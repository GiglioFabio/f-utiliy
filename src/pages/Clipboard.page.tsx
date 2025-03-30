import { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { ClipboardCopy } from 'lucide-react';
import { motion } from 'framer-motion';
import { invoke } from '@tauri-apps/api/core';

type ClipboardEntry = {
  content: string;
  timestamp: string;
};

export function ClipboardPage() {
  const [copied, setCopied] = useState<string | null>(null);

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

  const handleCopy = async (content: string) => {
    await writeText(content);
    setCopied(content);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className='space-y-4'>
      {clipBoardList.length === 0 && (
        <p className='text-gray-400'>Nessun contenuto disponibile.</p>
      )}
      <ul className='space-y-2 max-h-[80vh] overflow-y-auto pr-2'>
        {clipBoardList.map((entry, idx) => (
          <motion.li
            key={idx}
            whileHover={{ scale: 1.02 }}
            className='bg-gray-100 dark:bg-gray-800 p-3 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-between'
            onClick={() => handleCopy(entry.content)}>
            <div className='flex items-start gap-3'>
              <span className='text-xs text-gray-500 mt-1 w-5 text-right'>
                #{idx + 1}
              </span>
              <pre className='whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-100'>
                {entry.content}
              </pre>
            </div>
            <div className='pl-4 pt-1'>
              {copied === entry.content ? (
                <span className='text-green-500 text-xs font-medium'>
                  Copiato!
                </span>
              ) : (
                <ClipboardCopy className='w-4 h-4 text-gray-400 hover:text-black dark:hover:text-white' />
              )}
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
