
import React from 'react';
import { Category } from '../types.ts';

interface CategoryButtonProps {
  category: Category;
  isActive: boolean;
  onClick: (category: Category) => void;
  icon: string;
}

export const CategoryButton: React.FC<CategoryButtonProps> = ({ category, isActive, onClick, icon }) => {
  const getColors = () => {
    switch (category) {
      case Category.SCHOOL: 
        return isActive ? 'bg-cyan-400 border-cyan-600 text-black' : 'hover:bg-cyan-100 dark:hover:bg-cyan-900 border-[var(--border)]';
      case Category.OFFICE: 
        return isActive ? 'bg-orange-400 border-orange-600 text-black' : 'hover:bg-orange-100 dark:hover:bg-orange-900 border-[var(--border)]';
      case Category.CODING: 
        return isActive ? 'bg-lime-400 border-lime-600 text-black' : 'hover:bg-lime-100 dark:hover:bg-lime-900 border-[var(--border)]';
      case Category.SOCIAL: 
        return isActive ? 'bg-fuchsia-400 border-fuchsia-600 text-black' : 'hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900 border-[var(--border)]';
      default: 
        return 'bg-[var(--card-bg)] border-[var(--border)]';
    }
  };

  return (
    <button
      onClick={() => onClick(category)}
      className={`
        neobrutalism-button flex flex-col items-center justify-center gap-1 sm:gap-2 px-2 py-3 sm:py-4
        font-heading uppercase tracking-tighter border-4 transition-all h-full w-full
        ${getColors()}
        ${isActive ? 'translate-x-[2px] translate-y-[2px] !shadow-none' : 'shadow-[4px_4px_0px_0px_var(--shadow)]'}
      `}
    >
      <span className={`text-xl sm:text-2xl flex-shrink-0 transition-transform ${isActive ? 'scale-110' : ''}`}>
        {icon}
      </span>
      <span className="text-[10px] sm:text-[11px] lg:text-xs text-center leading-[1] sm:leading-tight break-words w-full max-w-full">
        {category}
      </span>
    </button>
  );
};
