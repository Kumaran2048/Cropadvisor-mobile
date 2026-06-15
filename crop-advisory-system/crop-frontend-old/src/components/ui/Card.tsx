import React from 'react';
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
}
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  noPadding = false,
  ...props
}) => {
  return (
    <div
      className={`bg-[var(--surface)] rounded-card shadow-card hover:shadow-cardHover transition-shadow duration-200 border border-[var(--border)] ${noPadding ? '' : 'p-5'} ${className}`}
      {...props}>
      
      {children}
    </div>);

};