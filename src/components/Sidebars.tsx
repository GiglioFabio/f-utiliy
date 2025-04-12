import {
  Clipboard,
  FileClock,
  Braces,
  Fingerprint,
  FileArchive,
  Text,
} from 'lucide-react';
import { MenuItem, MenuItemId } from '../interfaces';
import { ClipboardPage, UuidPage } from '../pages';
import JsonToolsPage from '../pages/JsonManage.page';
import RecentFilesPage from '../pages/RecentFile.page';
import SettingsPage from '../pages/Settings.page';
import StringToolsPage from '../pages/StringManage.page';

type Props = {
  selected: MenuItem;
  onSelect: (section: MenuItem) => void;
};

export const MENU_ITEMS: Record<MenuItemId, MenuItem> = {
  recent: {
    id: 'recent',
    label: 'Recenti',
    icon: FileArchive,
    header: '📂 File Recenti',
    content: <RecentFilesPage />,
  },
  clipboard: {
    id: 'clipboard',
    label: 'Clipboard',
    icon: Clipboard,
    header: '📋 Clipboard',
    content: <ClipboardPage />,
  },
  json: {
    id: 'json',
    label: 'JSON Tools',
    icon: Braces,
    header: '🛠️ Strumenti JSON',
    content: <JsonToolsPage />,
  },
  strings: {
    id: 'strings',
    label: 'String Tools',
    icon: Text,
    header: '🔤 String Tools',
    content: <StringToolsPage />,
  },
  uuid: {
    id: 'uuid',
    label: 'UUID Generator',
    icon: Fingerprint,
    header: '🔑 Generatore UUID',
    content: <UuidPage />,
  },
  settings: {
    id: 'settings',
    label: 'Settings',
    icon: FileClock,
    header: '⚙️ Settings',
    content: <SettingsPage />,
  },
};

export const DEFAULT_MENU_ITEM = MENU_ITEMS.recent;

export default function Sidebar({ selected, onSelect }: Props) {
  return (
    <div className='w-64 bg-sidebar-bg text-sidebar-text p-4 space-y-2'>
      <h2 className='text-xl font-bold mb-4'>Menu</h2>
      {Object.values(MENU_ITEMS).map((menu) => (
        <button
          key={menu.id}
          onClick={() => onSelect(menu)}
          className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded transition-all duration-150 ${
            selected.id === menu.id
              ? 'bg-sidebar-selectedBg'
              : 'hover:bg-sidebar-hoverBg'
          }`}>
          <menu.icon className='w-5 h-5' />
          <span>{menu.label}</span>
        </button>
      ))}
    </div>
  );
}
