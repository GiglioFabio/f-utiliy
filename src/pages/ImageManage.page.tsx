import React, { useState } from 'react';
import { Button, CustomSlider, LoaderOverlay, useToast } from '../core-ui';

import { pickFile } from '../utils';
import { invoke } from '@tauri-apps/api/core';

type FileToProcess = {
  path: string[];
  total: number;
  processed: number;
};

const ImageToolsPage: React.FC = () => {
  const [compressionLevel, setCompressionLevel] = useState(55);
  const [isLoading, setIsLoading] = useState(false);
  const [fileToProcess, setFileToProcess] = useState<FileToProcess>({
    total: 0,
    processed: 0,
    path: [],
  });
  const { showToast } = useToast();

  async function compressImage(
    filePath: string,
    outputPath: string,
    compressionLevel: number
  ) {
    invoke('compress_and_adjust_image', {
      path: filePath,
      outputPath: outputPath,
      compression: 100 - compressionLevel,
    });
    setFileToProcess((prev) => ({
      ...prev,
      processed: prev.processed + 1,
    }));
  }

  async function processCompressFiles() {
    if (fileToProcess.path) {
      console.log('Selected file:', fileToProcess);

      setIsLoading(true);

      if (fileToProcess.path.length === 1) {
        const singleSelect = fileToProcess.path[0];
        await compressImage(
          singleSelect,
          singleSelect.replace(/\.[^/.]+$/, '') + '_compressed.png',
          compressionLevel
        );
      } else {
        //create a folder and save all the images in it
        const now = new Date();
        const folderName =
          `f_utils_compressed_` +
          now.getFullYear().toString() +
          String(now.getMonth() + 1).padStart(2, '0') +
          String(now.getDate()).padStart(2, '0') +
          '_' +
          String(now.getHours()).padStart(2, '0') +
          String(now.getMinutes()).padStart(2, '0') +
          String(now.getSeconds()).padStart(2, '0');
        const folderPath =
          fileToProcess.path[0].split('/').slice(0, -1).join('/') +
          '/' +
          folderName;

        await Promise.all(
          fileToProcess.path.map(async (filePath: string) => {
            const nameCompressed = filePath.split('/').pop()!;
            const newPath = folderPath + '/' + nameCompressed;
            await compressImage(
              filePath,
              newPath.replace(/\.[^/.]+$/, '') + '_compressed.png',
              compressionLevel
            );
          })
        );
      }
      await new Promise((res) => setTimeout(res, 500));
      showToast(`Compressione terminata`, 'success');
      setIsLoading(false);
    }
  }

  async function selectImages() {
    const selecteds = await pickFile({
      multiple: true,
      extensions: ['png', 'jpg', 'jpeg'],
      saveToRecent: false,
    });
    if (selecteds) {
      setFileToProcess({
        path: selecteds.path,
        total: selecteds.path.length,
        processed: 0,
      });
    }
  }

  return (
    <>
      <div className='space-y-6'>
        <div className='flex  items-center gap-2'>
          <Button className='px-4 py-2 h-auto' onClick={selectImages}>
            📂 Seleziona l'immagine/i
          </Button>
        </div>
        <div>
          {fileToProcess.path.length > 0 && (
            <div className='mt-4 space-y-2'>
              <h3 className='font-semibold'>
                File selezionati:{fileToProcess.path.length}
              </h3>
              <ul className='divide-y divide-gray-200 text-sm max-h-64 overflow-y-auto'>
                {fileToProcess.path.map((filePath, index) => {
                  const segments = filePath.split('/');
                  const fileName = segments.pop();
                  const shortPath = segments.slice(-2).join('/'); // mostra solo le ultime 2 cartelle

                  return (
                    <li key={index} className='py-2'>
                      <div className='font-medium'>{fileName}</div>
                      <div className='text-xs text-gray-500 truncate'>
                        .../{shortPath}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className='flex gap-2 pt-2 items-center '>
                <div className='flex-1 min-w-[200px]'>
                  <CustomSlider
                    value={compressionLevel}
                    onChange={setCompressionLevel}
                    label={`Compression ${compressionLevel}%`}
                  />
                </div>
                <Button
                  className=' px-4 py-2 h-auto'
                  onClick={processCompressFiles}>
                  💾 Comprimi
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {isLoading && (
        <LoaderOverlay
          label={`Processing ${
            (fileToProcess.processed / fileToProcess.total) * 100
          }%`}
        />
      )}
    </>
  );
};

export default ImageToolsPage;
