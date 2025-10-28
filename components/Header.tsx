import React from 'react';
import { NotebookIcon, LogOutIcon, LogInIcon } from './icons';

interface UserProfile {
  name: string;
  picture: string;
}

interface HeaderProps {
  user: UserProfile | null;
  onLogout: () => void;
  onLoginClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onLoginClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm shadow-md z-30 h-16 flex items-center justify-between px-4">
      <div className="flex items-center space-x-2">
        <NotebookIcon className="w-8 h-8 text-cyan-400" />
        <h1 className="text-xl font-bold text-white tracking-wider">AI Notebook</h1>
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full border-2 border-slate-700" />
            <span className="text-sm font-medium text-slate-300 hidden sm:block">{user.name}</span>
            <button onClick={onLogout} className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors" aria-label="Log out">
              <LogOutIcon className="w-6 h-6" />
            </button>
          </>
        ) : (
          <button onClick={onLoginClick} className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors" aria-label="Sign in">
            <LogInIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
