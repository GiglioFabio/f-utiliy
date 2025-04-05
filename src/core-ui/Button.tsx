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
        'inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors shadow',
        className
      )}
      {...props}>
      {children}
    </button>
  );
};
