import { Dialog, Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';

export function AlertDialog({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-200'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-150'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'>
          <div className='fixed inset-0 bg-black/50' />
        </Transition.Child>

        <div className='fixed inset-0 flex items-center justify-center p-4'>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-200'
            enterFrom='scale-95 opacity-0'
            enterTo='scale-100 opacity-100'
            leave='ease-in duration-150'
            leaveFrom='scale-100 opacity-100'
            leaveTo='scale-95 opacity-0'>
            <Dialog.Panel className='w-full max-w-md rounded-2xl bg-background text-foreground border-primary p-6 shadow-xl'>
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

export const AlertDialogContent = ({ children }: { children: ReactNode }) => (
  <div className='space-y-4'>{children}</div>
);

export const AlertDialogHeader = ({ children }: { children: ReactNode }) => (
  <div className='space-y-1'>{children}</div>
);

export const AlertDialogTitle = ({ children }: { children: ReactNode }) => (
  <h2 className='text-lg font-semibold'>{children}</h2>
);

export const AlertDialogDescription = ({
  children,
}: {
  children: ReactNode;
}) => <p className='text-sm text-muted-foreground'>{children}</p>;

export const AlertDialogFooter = ({ children }: { children: ReactNode }) => (
  <div className='flex justify-end gap-2 pt-4'>{children}</div>
);
