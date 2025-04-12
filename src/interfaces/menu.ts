export type MenuItemId =
  | 'clipboard'
  | 'json'
  | 'uuid'
  | 'recent'
  | 'settings'
  | 'strings';

export type MenuItem = {
  id: MenuItemId;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  header: React.ReactNode | null;
  content: React.ReactNode | null;
};
