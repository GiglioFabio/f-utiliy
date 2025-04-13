import { useState } from 'react';
import { ClipboardCopy, RefreshCw } from 'lucide-react';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { useGlobalContext } from '../contexts';
import { useToast } from '../core-ui';

export function UuidPage() {
  const { uuid, setUuid } = useGlobalContext();
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

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
    showToast('Copiato negli appunti!', 'success');
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className='space-y-6'>
      <button
        onClick={generate}
        className='bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded inline-flex items-center gap-2 transition-colors'>
        <RefreshCw className='w-4 h-4' />
        Genera UUID v4
      </button>

      {uuid && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={copy}
          className='flex items-center justify-between bg-muted text-muted-foreground p-4 rounded shadow-sm transition-colors'>
          <code className='text-sm break-all font-mono'>{uuid}</code>

          <div className='pl-4'>
            {copied ? (
              <span className='text-green-500 text-xs font-medium'>
                Copiato!
              </span>
            ) : (
              <ClipboardCopy className='w-4 h-4 text-muted-foreground hover:text-foreground' />
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
