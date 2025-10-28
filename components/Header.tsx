
import React from 'react';
import { NotebookIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm shadow-md z-30 h-16 flex items-center px-4">
      <div className="flex items-center space-x-2">
        <NotebookIcon className="w-8 h-8 text-cyan-400" />
        <h1 className="text-xl font-bold text-white tracking-wider">AI Notebook</h1>
      </div>
    </header>
  );
};
