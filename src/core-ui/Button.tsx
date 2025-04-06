import React from 'react';
import { cn } from './util';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'default' | 'destructive' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: ReactNode;
  variant?: Variant;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  children,
  variant = 'default',
  ...props
}) => {
  const base =
    'inline-flex items-center px-4 py-2 text-sm font-medium rounded-2xl transition-colors shadow focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

  const variants: Record<Variant, string> = {
    default: 'bg-primary text-primary-foreground hover:opacity-90',
    destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
    outline:
      'border border-input text-foreground bg-transparent hover:bg-muted',
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
};
