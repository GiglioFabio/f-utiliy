import React from 'react';
import { cn } from './util';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => {
  return (
    <textarea
      className={cn(
        'w-full px-3 py-2 rounded-lg shadow-sm resize vertical',
        'bg-background text-foreground border border-input',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring',
        className
      )}
      {...props}
    />
  );
};
