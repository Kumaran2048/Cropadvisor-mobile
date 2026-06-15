import React, { forwardRef } from 'react';
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: {
    value: string;
    label: string;
  }[];
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label &&
        <label className="block text-sm font-medium text-[var(--text)] mb-1">
            {label}
          </label>
        }
        <select
          ref={ref}
          className={`block w-full rounded-lg border ${error ? 'border-danger' : 'border-[var(--border)]'} bg-[var(--surface)] text-[var(--text)] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-farmer focus:border-transparent ${className}`}
          {...props}>
          
          {options.map((opt) =>
          <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )}
        </select>
        {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      </div>);

  }
);
Select.displayName = 'Select';