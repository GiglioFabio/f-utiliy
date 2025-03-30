import { useState } from 'react';
import { ClipboardCopy, RefreshCw } from 'lucide-react';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { useGlobalContext } from '../GlobalContex';

export function UuidPage() {
  const { uuid, setUuid } = useGlobalContext();
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    const newUuid = uuidv4(); // per ora v4
    setUuid(newUuid);
    setCopied(false);
    await writeText(newUuid);
  };

  const copy = async () => {
    if (!uuid) return;
    await writeText(uuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className='space-y-6'>
      <button
        onClick={generate}
        className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-flex items-center gap-2'>
        <RefreshCw className='w-4 h-4' /> Genera UUID v4
      </button>

      {uuid && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-4 rounded shadow-sm'>
          <code className='text-sm break-all font-mono text-gray-800 dark:text-gray-200'>
            {uuid}
          </code>
          <button
            onClick={copy}
            className='ml-4 text-sm text-blue-600 hover:text-blue-800'>
            {copied ? '✅ Copiato' : <ClipboardCopy className='w-4 h-4' />}
          </button>
        </motion.div>
      )}
    </div>
  );
}
