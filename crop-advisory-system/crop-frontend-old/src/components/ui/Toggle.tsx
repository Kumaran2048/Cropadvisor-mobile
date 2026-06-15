import React from 'react';
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}
export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label }) => {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)} />
        
        <div
          className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-farmer' : 'bg-gray-300 dark:bg-gray-600'}`}>
        </div>
        <div
          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`}>
        </div>
      </div>
      {label &&
      <div className="ml-3 text-sm font-medium text-[var(--text)]">
          {label}
        </div>
      }
    </label>);

};