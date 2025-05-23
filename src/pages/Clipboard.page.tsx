import { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { ClipboardCopy } from 'lucide-react';
import { motion } from 'framer-motion';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '../core-ui';

type ClipboardEntry = {
  content: string;
  timestamp: string;
};

const MAX_CHAR_LENGTH = 500;

export function ClipboardPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const { showToast } = useToast();

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
    showToast('Copiato negli appunti!', 'success');
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className='space-y-4'>
      {clipBoardList.length === 0 && (
        <p className='text-muted-foreground'>Nessun contenuto disponibile.</p>
      )}
      <ul className='space-y-2 max-h-[80vh] overflow-y-auto pr-2'>
        {clipBoardList.map((entry, idx) => (
          <motion.li
            key={idx}
            whileHover={{ scale: 1.02 }}
            className='bg-muted text-muted-foreground p-3 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-between'
            onClick={() => handleCopy(entry.content)}>
            <div className='flex items-start gap-3'>
              <span className='text-xs text-muted-foreground mt-1 w-5 text-right'>
                #{idx + 1}
              </span>
              <pre className='whitespace-pre-wrap font-mono text-sm text-foreground'>
                {entry.content.length > MAX_CHAR_LENGTH
                  ? `${entry.content.slice(0, MAX_CHAR_LENGTH)}...`
                  : entry.content}
              </pre>
            </div>
            <div className='pl-4'>
              {copied === entry.content ? (
                <span className='text-green-500 text-xs font-medium'>
                  Copiato!
                </span>
              ) : (
                <ClipboardCopy className='w-4 h-4 text-muted-foreground hover:text-foreground' />
              )}
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
