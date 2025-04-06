import { invoke } from '@tauri-apps/api/core';

export interface RecentFile {
  path: string;
  name: string;
  tags: string[];
}

export async function loadRecentFiles(): Promise<RecentFile[]> {
  const files = await invoke<RecentFile[]>('load_recent_files');
  return files;
}

export function addRecentFile(file: RecentFile) {
  invoke('add_recent_file', {
    path: file.path,
    name: file.name,
    tags: file.tags,
  });
}
