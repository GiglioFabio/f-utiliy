import { DialogFilter, open } from '@tauri-apps/plugin-dialog';
import { addRecentFile } from './recent-files';
// import { readTextFile } from '@tauri-apps/api/fs';

export type FileType =
  | 'json'
  | 'txt'
  | 'conf'
  | 'xml'
  | 'csv'
  | 'yaml'
  | 'html'
  | 'js'
  | 'jpg'
  | 'jpeg'
  | 'png'
  | 'gif'
  | 'webp'
  | 'svg'
  | 'css';

export async function pickFile(props: {
  multiple?: boolean;
  saveToRecent?: boolean;
  extensions?: FileType[];
}): Promise<{ path: string[] } | undefined> {
  const { multiple, saveToRecent = true, extensions } = props;
  const filters: DialogFilter[] =
    (extensions?.length ?? 0) > 0
      ? [{ name: 'File', extensions: extensions ?? [] }]
      : [];
  const options = {
    multiple: multiple ?? false,
    filters,
  };
  const selected = await open(options);

  if (!selected) return;

  let returnValue = [];

  if (Array.isArray(selected)) {
    returnValue = [...selected];
  } else {
    returnValue = [selected];
  }

  if (saveToRecent) {
    for (const file of returnValue) {
      // Salva nei recenti
      const name = selected.split('/').pop()!;
      addRecentFile({ name, path: file, tags: [] });
    }
  }

  return { path: returnValue };
}
