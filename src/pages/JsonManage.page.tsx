import React, { useState } from 'react';
import { Button, Card, CardContent, Textarea } from '../core-ui';

import {
  FileJson2,
  Code2,
  Sparkles,
  ClipboardCopy,
  CheckCircle2,
} from 'lucide-react';

const JsonToolsPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleParse = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError('');
    } catch {
      try {
        const restest = input.replace(/\//g, '');
        const parsed = JSON.parse(restest);
        setOutput(JSON.stringify(parsed, null, 2));
        setError('');
      } catch (e) {
        setError('Errore di parsing JSON.');
      }
    }
  };

  const handleStringify = () => {
    try {
      const obj = eval(`(${input})`);
      setOutput(JSON.stringify(obj));
      setError('');
    } catch {
      setError('Errore durante lo stringify.');
    }
  };

  const handleBeautify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError('');
    } catch {
      setError('Impossibile beautificare. Input non valido.');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      console.error('Errore durante la copia.');
    }
  };

  const handleStringifyEscaped = () => {
    try {
      const parsed = JSON.parse(input); // prima controlla che sia JSON valido
      const result = JSON.stringify(JSON.stringify(parsed));
      setOutput(result);
      setError('');
    } catch {
      setError('Errore durante la stringa escaped. Controlla il formato JSON.');
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap gap-2 mb-6'>
        <Button onClick={handleParse}>
          <FileJson2 className='mr-2 h-4 w-4' />
          JSON Parse
        </Button>
        <Button onClick={handleStringify}>
          <Code2 className='mr-2 h-4 w-4' />
          Stringify
        </Button>
        <Button onClick={handleBeautify}>
          <Sparkles className='mr-2 h-4 w-4' />
          Beautify
        </Button>
        <Button onClick={handleStringifyEscaped}>
          <Code2 className='mr-2 h-4 w-4' />
          Stringify Escaped
        </Button>
      </div>
      {error && <p className='text-red-500 text-sm mt-2'>{error}</p>}

      <div className='flex flex-col gap-4'>
        <Card className='rounded-2xl shadow-md'>
          <CardContent>
            <label className='font-semibold text-sm mb-2 block'>Input</label>
            <Textarea
              className='min-h-[150px] font-mono'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Inserisci qui il JSON o oggetto JS'
            />
          </CardContent>
        </Card>

        <Card className='rounded-2xl shadow-md'>
          <CardContent className='relative'>
            <div className='flex justify-between items-center mb-2'>
              <label className='font-semibold text-sm'>Output</label>
              <Button onClick={handleCopy} className='text-sm px-3 py-1'>
                {copied ? (
                  <>
                    <CheckCircle2 className='h-4 w-4 mr-1' />
                    Copiato!
                  </>
                ) : (
                  <>
                    <ClipboardCopy className='h-4 w-4 mr-1' />
                    Copia
                  </>
                )}
              </Button>
            </div>
            <Textarea
              className='min-h-[250px] font-mono'
              value={output}
              readOnly
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JsonToolsPage;
