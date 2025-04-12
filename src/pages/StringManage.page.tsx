import React, { useState } from 'react';
import { Button, Card, CardContent, Textarea } from '../core-ui';

import { FileJson2 } from 'lucide-react';

const StringToolsPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [output, setOutput] = useState('');

  const handleCount = () => {
    const count = input.length;
    setOutput(`Caratteri: ${count}`);
    setError('');
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap gap-2 mb-6'>
        <Button onClick={handleCount}>
          <FileJson2 className='mr-2 h-4 w-4' />
          Conteggio
        </Button>
      </div>
      {error && <p className='text-red-500 text-sm mt-2'>{error}</p>}
      {output && <p className='text-green-500 text-sm mt-2'>{output}</p>}

      <div className='flex flex-col gap-4'>
        <Card className='rounded-2xl shadow-md'>
          <CardContent>
            <label className='font-semibold text-sm mb-2 block'>Input</label>
            <Textarea
              className='min-h-[150px] font-mono'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Inserisci qui il testo'
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StringToolsPage;
