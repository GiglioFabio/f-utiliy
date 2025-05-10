import { useEffect, useState } from 'react';
import Sidebar, { DEFAULT_MENU_ITEM } from './components/Sidebars';
import ContentArea from './components/Content-Area';
import { motion } from 'framer-motion';
import { MenuItem } from './interfaces';
import { toggleInitialSpotifyMonitor, toggleInitialTheme } from './utils';
import { DialogProvider, GlobalProvider } from './contexts';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './components/ErrorFallback';
import { ToastProvider } from './core-ui';

function App() {
  const [selected, setSelected] = useState<MenuItem>(DEFAULT_MENU_ITEM);

  useEffect(() => {
    toggleInitialTheme();
    toggleInitialSpotifyMonitor();
  }, []);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Logica di reset, ad esempio: navigate('/'), window.location.reload(), ecc.
        console.log('Resetting error boundary');
        window.location.reload();
      }}>
      <GlobalProvider>
        <ToastProvider>
          <DialogProvider>
            <div className='flex h-screen bg-background text-foreground'>
              <Sidebar selected={selected} onSelect={setSelected} />
              <motion.div
                key={selected.id}
                className='flex-1 p-6 overflow-y-auto'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}>
                <ContentArea selected={selected} />
              </motion.div>
            </div>
          </DialogProvider>
        </ToastProvider>
      </GlobalProvider>
    </ErrorBoundary>
  );
}

export default App;
