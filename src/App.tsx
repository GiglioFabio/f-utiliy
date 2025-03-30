import { useState } from 'react';
import Sidebar, { LEFT_MENU_ITEMS } from './components/Sidebars';
import ContentArea from './components/Content-Area';
import { motion } from 'framer-motion';
import { MenuItem } from './interfaces';

function App() {
  const [selected, setSelected] = useState<MenuItem>(LEFT_MENU_ITEMS[0]);

  return (
    <div className='flex h-screen'>
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
  );
}

export default App;
