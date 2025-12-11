import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full rounded-md border bg-white px-4 py-2.5 text-sm text-oxford-blue
          placeholder:text-text-muted
          transition-all duration-fast ease-out
          focus:border-tabiya-green focus:outline-none focus:ring-2 focus:ring-tabiya-green/20
          disabled:cursor-not-allowed disabled:opacity-50
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'}
          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
