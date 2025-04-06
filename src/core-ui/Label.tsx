import * as React from 'react';
import { cn } from './util';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn('block text-sm font-medium text-foreground', className)}
        {...props}
      />
    );
  }
);

Label.displayName = 'Label';
