export type MenuItemId = 'clipboard' | 'json' | 'uuid' | 'projects' | 'recent';

export type MenuItem = {
  id: MenuItemId;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  header: React.ReactNode | null;
  content: React.ReactNode | null;
};
