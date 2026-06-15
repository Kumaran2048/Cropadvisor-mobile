import React, { forwardRef } from 'react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label &&
        <label className="block text-sm font-medium text-[var(--text)] mb-1">
            {label}
          </label>
        }
        <div className="relative">
          {icon &&
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
              {icon}
            </div>
          }
          <input
            ref={ref}
            className={`block w-full rounded-lg border ${error ? 'border-danger' : 'border-[var(--border)]'} bg-[var(--surface)] text-[var(--text)] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-farmer focus:border-transparent ${icon ? 'pl-10' : ''} ${className}`}
            {...props} />
          
        </div>
        {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      </div>);

  }
);
Input.displayName = 'Input';