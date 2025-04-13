// components/LoaderOverlay.tsx
interface LoaderOverlayProps {
  percentage?: number;
  label?: string;
}

export function LoaderOverlay({ percentage, label }: LoaderOverlayProps) {
  return (
    <div className='fixed inset-0 bg-background bg-opacity-60 z-50 flex items-center justify-center'>
      <div className='flex flex-col items-center space-y-3'>
        <div className='w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin' />
        {label && <p className='text-sm text-muted-foreground'>{label}</p>}
        {percentage !== undefined && (
          <p className='text-sm font-semibold text-foreground'>{percentage}%</p>
        )}
      </div>
    </div>
  );
}
