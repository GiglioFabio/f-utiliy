export const LOCAL_KEY = 'recent_files';

export interface RecentFile {
  path: string;
  name: string;
  tags: string[];
}

export function loadRecentFiles(): RecentFile[] {
  const data = localStorage.getItem(LOCAL_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveRecentFiles(files: RecentFile[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(files));
}

export function addRecentFile(file: RecentFile) {
  const current = loadRecentFiles();
  const exists = current.find((f) => f.path === file.path);
  const updated = exists
    ? current
    : [{ ...file, tags: [] }, ...current].slice(0, 50); // max 50 elementi
  saveRecentFiles(updated);
}
