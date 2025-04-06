import React from 'react';
import { cn } from './util';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button: React.FC<ButtonProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-2xl hover:opacity-90 transition-colors shadow',
        className
      )}
      {...props}>
      {children}
    </button>
  );
};
