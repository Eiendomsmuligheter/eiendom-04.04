import React from 'react';
import { cn } from '../../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border p-6 shadow-lg backdrop-blur-lg',
          variant === 'default' && 'bg-white/5 border-white/10',
          variant === 'gradient' && 'bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-blue-500/20',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card }; 