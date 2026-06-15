import React from 'react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles =
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-farmer text-white hover:bg-farmer-light focus:ring-farmer',
    secondary:
    'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:bg-gray-50 dark:hover:bg-gray-800',
    danger: 'bg-danger text-white hover:bg-red-700 focus:ring-danger',
    outline:
    'border-2 border-farmer text-farmer hover:bg-farmer hover:text-white',
    ghost:
    'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-gray-100 dark:hover:bg-gray-800'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}>
      
      {children}
    </button>);

};