// components/providers/DialogProvider.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from '../components';
import { Button } from '../core-ui';

type DialogOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
};

type DialogContextType = {
  showDialog: (options: DialogOptions) => void;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialogOptions, setDialogOptions] = useState<DialogOptions | null>(
    null
  );

  const showDialog = (options: DialogOptions) => {
    setDialogOptions(options);
  };

  const closeDialog = () => {
    setDialogOptions(null);
  };

  const handleConfirm = () => {
    dialogOptions?.onConfirm?.();
    closeDialog();
  };

  return (
    <DialogContext.Provider value={{ showDialog }}>
      {children}

      <AlertDialog open={!!dialogOptions}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogOptions?.title}</AlertDialogTitle>
            {dialogOptions?.description && (
              <AlertDialogDescription>
                {dialogOptions.description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant='outline' onClick={closeDialog}>
              {dialogOptions?.cancelText || 'Annulla'}
            </Button>
            <Button variant='destructive' onClick={handleConfirm}>
              {dialogOptions?.confirmText || 'Conferma'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DialogContext.Provider>
  );
}

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog deve essere usato dentro a <DialogProvider>');
  }
  return context;
};
