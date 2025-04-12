import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
import { cn } from './util';

// Type-safe TabsContext
type TabsContextType<T extends string> = {
  activeTab: T;
  setActiveTab: Dispatch<SetStateAction<T>>;
};

const TabsContext = createContext<TabsContextType<any> | undefined>(undefined);

// Custom hook
function useTabsContext<T extends string>() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabsContext must be used within a <Tabs />');
  }
  return context as TabsContextType<T>;
}

// Tabs component
interface TabsProps<T extends string> {
  defaultValue: T;
  children: ReactNode;
  className?: string;
}

export function Tabs<T extends string>({
  defaultValue,
  children,
  className,
}: TabsProps<T>) {
  const [activeTab, setActiveTab] = useState<T>(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return <div className={cn('flex border-b', className)}>{children}</div>;
}

interface TabsTriggerProps<T extends string> {
  value: T;
  children: ReactNode;
}

export function TabsTrigger<T extends string>({
  value,
  children,
}: TabsTriggerProps<T>) {
  const { activeTab, setActiveTab } = useTabsContext<T>();
  const isActive = activeTab === value;

  return (
    <button
      className={cn(
        'px-4 py-2 text-sm font-medium transition-colors border-b-2',
        isActive
          ? 'border-primary text-primary'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      )}
      onClick={() => setActiveTab(value)}>
      {children}
    </button>
  );
}

interface TabsContentProps<T extends string> {
  value: T;
  children: ReactNode;
}

export function TabsContent<T extends string>({
  value,
  children,
}: TabsContentProps<T>) {
  const { activeTab } = useTabsContext<T>();
  return activeTab === value ? <div className='pt-4'>{children}</div> : null;
}
