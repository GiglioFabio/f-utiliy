import React from 'react';
import type { FallbackProps } from 'react-error-boundary';

const ErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const pathname =
    typeof window !== 'undefined' ? window.location.pathname : 'N/A';

  return (
    <div className='p-6 rounded-2xl bg-muted text-muted-foreground border border-border shadow-lg max-w-2xl mx-auto mt-10'>
      <h2 className='text-2xl font-semibold mb-2 text-foreground'>
        Qualcosa è andato storto
      </h2>

      <p className='mb-4 text-foreground'>
        Si è verificato un problema nella pagina{' '}
        <span className='font-medium text-accent'>{pathname}</span>. Puoi
        provare a ripetere l'azione oppure contattare il supporto.
      </p>

      <div className='bg-background border border-input p-4 rounded-xl text-sm font-mono overflow-auto max-h-60 mb-4'>
        <strong className='block mb-2 text-secondary-foreground'>
          Messaggio di errore:
        </strong>
        <pre className='whitespace-pre-wrap break-words'>{error.message}</pre>

        {error.stack && (
          <>
            <strong className='block mt-4 mb-2 text-secondary-foreground'>
              Stack trace:
            </strong>
            <pre className='whitespace-pre-wrap break-words'>{error.stack}</pre>
          </>
        )}
      </div>

      <div className='flex justify-end'>
        <button
          onClick={resetErrorBoundary}
          className='px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition'>
          🔄 Riprova
        </button>
      </div>
    </div>
  );
};

export default ErrorFallback;
