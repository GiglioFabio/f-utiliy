import { open } from '@tauri-apps/plugin-dialog';
// import { readTextFile } from '@tauri-apps/api/fs';
import { addRecentFile } from './file-local-storage';

export async function pickFile() {
  const selected = await open({
    multiple: false,
    // filters: [{ name: 'File di testo', extensions: ['json', 'txt', 'conf'] }],
  });

  if (!selected || typeof selected !== 'string') return;

  // Salva nei recenti
  const name = selected.split('/').pop()!;
  addRecentFile({ name, path: selected, tags: [] });

  return { path: selected };
}
