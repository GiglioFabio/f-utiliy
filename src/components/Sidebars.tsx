import {
  Clipboard,
  FileText,
  FileClock,
  Braces,
  Fingerprint,
} from 'lucide-react';
import { MenuItem } from '../interfaces';
import { ClipboardPage, UuidPage } from '../pages';
import JsonToolsPage from '../pages/JsonManage.page';

type Props = {
  selected: MenuItem;
  onSelect: (section: MenuItem) => void;
};

export const LEFT_MENU_ITEMS: MenuItem[] = [
  {
    id: 'clipboard',
    label: 'Clipboard',
    icon: Clipboard,
    header: '📋 Clipboard',
    content: <ClipboardPage />,
  },
  {
    id: 'json',
    label: 'JSON Tools',
    icon: Braces,
    header: '🛠️ Strumenti JSON',
    content: <JsonToolsPage />,
  },
  {
    id: 'uuid',
    label: 'UUID Generator',
    icon: Fingerprint,
    header: '🔑 Generatore UUID',
    content: <UuidPage />,
  },
  {
    id: 'projects',
    label: 'Progetti',
    icon: FileText,
    header: null,
    content: null,
  },
  {
    id: 'recent',
    label: 'Recenti',
    icon: FileClock,
    header: null,
    content: null,
  },
];

export default function Sidebar({ selected, onSelect }: Props) {
  return (
    <div className='w-64 bg-gray-900 text-white p-4 space-y-2'>
      <h2 className='text-xl font-bold mb-4'>Menu</h2>
      {LEFT_MENU_ITEMS.map((menu) => (
        <button
          key={menu.id}
          onClick={() => onSelect(menu)}
          className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded transition-all duration-150 ${
            selected.id === menu.id ? 'bg-gray-700' : 'hover:bg-gray-800'
          }`}>
          <menu.icon className='w-5 h-5' />
          <span>{menu.label}</span>
        </button>
      ))}
    </div>
  );
}
