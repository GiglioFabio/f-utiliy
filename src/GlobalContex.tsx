import React, { createContext, useContext, useState } from 'react';

type GlobalContextType = {
  uuid: string | null;
  setUuid: (val: string) => void;
  // puoi aggiungere altri valori qui in futuro
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [uuid, setUuid] = useState<string | null>(null);

  return (
    <GlobalContext.Provider value={{ uuid, setUuid }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};
