
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12 sm:p-10 transition-colors duration-300">
      <main className="w-full max-w-2xl neobrutalism-card p-6 sm:p-10 relative bg-[var(--card-bg)]">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500 border-l-4 border-b-4 border-black translate-x-2 -translate-y-2 rotate-12 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-pink-500 border-r-4 border-t-4 border-black -translate-x-2 translate-y-2 -rotate-12 -z-10"></div>
        
        {children}
      </main>
      <footer className="mt-12 py-2 px-6 bg-black text-white font-bold neobrutalism-button uppercase text-xs tracking-widest border-4 border-black">
        EXCUSEMASTER v3.2 // 2025 // STATUS: OPTIMAL
      </footer>
    </div>
  );
};
