import React, { useEffect, useState } from 'react';

import { FolderOpen, Search, Tag, Eye } from 'lucide-react';
import {
  loadRecentFiles,
  saveRecentFiles,
  addRecentFile,
  RecentFile,
  pickFile,
} from '../utils';
import { Button, Card, CardContent } from '../core-ui';
import { invoke } from '@tauri-apps/api/core';
import { Input, TagInput } from '../components';

const RecentFilesPage: React.FC = () => {
  const [files, setFiles] = useState<RecentFile[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setFiles(loadRecentFiles());
  }, []);

  const filtered = files.filter(
    (f) =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
  );

  const handleAddTag = (file: RecentFile, newTag: string) => {
    if (!newTag.trim()) return;
    const updated = files.map((f) =>
      f.path === file.path && !f.tags.includes(newTag)
        ? { ...f, tags: [...f.tags, newTag] }
        : f
    );
    setFiles(updated);
    saveRecentFiles(updated);
  };

  const removeTag = (tagToRemove: string) => {
    const updated = files.map((file) => ({
      ...file,
      tags: file.tags.filter((tag) => tag !== tagToRemove),
    }));
    setFiles(updated);
    saveRecentFiles(updated);
  };

  const handleOpenFile = async (file: RecentFile) => {
    invoke('open_file', { path: file.path });
    addRecentFile(file);
    setFiles(loadRecentFiles());
  };

  const handleRevealFile = async (file: RecentFile) => {
    invoke('reveal_in_folder', { path: file.path });
    addRecentFile(file);
    setFiles(loadRecentFiles());
  };

  return (
    <div className='flex flex-col  items-center gap-2 mb-6'>
      <div className='flex flex-col md:flex-row md:items-center gap-2 mb-6 w-full'>
        <div className='flex items-center gap-2 flex-1 border border-gray-300 rounded-lg px-3 py-2 shadow-sm'>
          <Search className='h-5 w-5 text-gray-500' />
          <Input
            type='text'
            placeholder='Cerca per nome o tag...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className='border-none shadow-none focus:ring-0 focus:outline-none px-0'
          />
        </div>

        <Button
          className='whitespace-nowrap px-4 py-2'
          onClick={async () => {
            const file = await pickFile();
            if (file) {
              handleOpenFile({
                ...file,
                name: file.path.split('/').pop()!,
                tags: [],
              });
            }
          }}>
          📂 Seleziona file
        </Button>
      </div>

      <div className='space-y-4 w-full'>
        {filtered.map((file) => (
          <Card key={file.path} className='rounded-2xl shadow w-full'>
            <CardContent className='p-4 w-full'>
              <div className='flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-3'>
                <div className='flex-1 min-w-0'>
                  <p className='font-semibold break-words leading-snug text-base'>
                    {file.name}
                  </p>
                  <p className='text-sm text-gray-500 break-all leading-snug'>
                    {file.path}
                  </p>
                </div>

                <div className='flex gap-2 shrink-0 mt-2 md:mt-0'>
                  <Button onClick={() => handleOpenFile(file)}>
                    <Eye className='h-4 w-4' />
                  </Button>
                  <Button onClick={() => handleRevealFile(file)}>
                    <FolderOpen className='h-4 w-4' />
                  </Button>
                </div>
              </div>

              <div className='flex flex-wrap items-center gap-2'>
                {file.tags.map((tag, i) => (
                  <div
                    key={tag}
                    className='flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full'>
                    <span>#{tag}</span>
                    <button
                      onClick={() => removeTag(tag)}
                      className='ml-2 text-blue-500 hover:text-blue-700'>
                      &times;
                    </button>
                  </div>
                ))}
                <TagInput onAdd={(tag) => handleAddTag(file, tag)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecentFilesPage;
