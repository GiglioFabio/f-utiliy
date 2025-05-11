import { invoke } from '@tauri-apps/api/core';
import React, { useEffect, useState } from 'react';
import { Button, Card, CardContent } from '../core-ui';

type FileEntry = {
  name: string;
  path: string;
};

const RecordingPage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [files, setFiles] = useState<FileEntry[]>([]);

  const fetchFiles = async () => {
    const files = await invoke('get_recorded_files');
    setFiles(files as FileEntry[]);
  };

  const startRecording = async () => {
    try {
      await invoke('start_video_recording_invoke');
      setIsRecording(true);
      await fetchFiles();
    } catch (error) {
      console.error("Errore nell'avvio della registrazione:", error);
    }
  };

  const stopRecording = async () => {
    try {
      await invoke('stop_video_recording_invoke');
      setIsRecording(false);
      await fetchFiles();
    } catch (error) {
      console.error('Errore nel fermare la registrazione:', error);
    }
  };

  const openFolder = async () => {
    await invoke('open_recording_folder');
  };

  const openFile = async (path: string) => {
    await invoke('open_file_recording', { path: path });
  };

  const deleteFile = async (path: string) => {
    try {
      await invoke('delete_file_recording', { path: path });
      await fetchFiles();
    } catch (error) {
      console.error('Errore nella cancellazione del file:', error);
    }
  };

  const createTranscript = async (path: string) => {
    console.log('Transcript creato per:', path);
    await invoke('create_transcript', { path: path });
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className='p-6 bg-background text-foreground'>
      <div className='flex gap-4 mb-6'>
        <Button
          onClick={startRecording}
          disabled={isRecording}
          className='bg-primary text-primary-foreground'>
          Inizia Registrazione
        </Button>
        <Button
          onClick={stopRecording}
          disabled={!isRecording}
          className='bg-destructive text-destructive-foreground'>
          Termina Registrazione
        </Button>
        <Button
          onClick={openFolder}
          className='bg-secondary text-secondary-foreground'>
          Apri Cartella
        </Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {files.map((file) => (
          <Card key={file.path} className='border border-border'>
            <CardContent>
              <div className='flex flex-col gap-2'>
                <p>{file.name}</p>
                <Button
                  onClick={() => openFile(file.path)}
                  className='bg-primary text-primary-foreground'>
                  Apri
                </Button>
                {/* <Button
                  onClick={() => deleteFile(file.path)}
                  className='bg-destructive text-destructive-foreground'>
                  Elimina
                </Button> */}
                <Button
                  onClick={() => createTranscript(file.path)}
                  className='bg-accent text-accent-foreground'>
                  Crea Transcript
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecordingPage;
