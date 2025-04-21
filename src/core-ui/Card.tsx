import React from 'react';
import { cn } from './util';

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground border border-border rounded-2xl shadow-sm',
        className
      )}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className, onClick }) => {
  return (
    <div onClick={onClick} className={`p-4 ${className ?? ''}`}>
      {children}
    </div>
  );
};
