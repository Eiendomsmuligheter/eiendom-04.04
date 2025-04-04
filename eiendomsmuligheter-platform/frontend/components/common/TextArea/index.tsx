import React from 'react';
import { cn } from '../../../utils/cn';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-blue-100 mb-1">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <textarea
          className={cn(
            'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white',
            'placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'resize-none',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {(error || helperText) && (
          <p className={cn('mt-1 text-sm', error ? 'text-red-400' : 'text-gray-400')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export { TextArea }; 