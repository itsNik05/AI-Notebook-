import React, { useEffect, useRef } from 'react';
import { NotebookIcon, XIcon } from './icons';

interface LoginViewProps {
  onLogin: (credentialResponse: any) => void;
  onClose: () => void;
}

// Add a type declaration for the 'google' object on the window
declare global {
  interface Window {
    google: any;
  }
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onClose }) => {
  const signInButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && signInButtonRef.current) {
        try {
          window.google.accounts.id.initialize({
            // IMPORTANT: Replace with your actual Google Cloud Client ID
            client_id: process.env.GOOGLE_CLIENT_ID,
            callback: onLogin,
          });
          window.google.accounts.id.renderButton(
            signInButtonRef.current,
            { theme: 'outline', size: 'large', type: 'standard', text: 'signin_with', shape: 'pill' }
          );
        } catch (error) {
          console.error("Google Sign-In initialization error:", error);
        }
      }
    };
    
    // The Google script is loaded asynchronously. We need to wait for it.
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      initializeGoogleSignIn();
    } else {
      window.addEventListener('load', initializeGoogleSignIn);
      return () => window.removeEventListener('load', initializeGoogleSignIn);
    }

  }, [onLogin]);

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-lg z-50 flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="relative bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-slate-700">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full text-slate-500 hover:bg-slate-700 hover:text-slate-300 transition-colors" aria-label="Close login">
            <XIcon className="w-6 h-6" />
        </button>
        <div className="flex items-center justify-center space-x-3 mb-4">
          <NotebookIcon className="w-10 h-10 text-cyan-400" />
          <h1 className="text-3xl font-bold tracking-wider text-white">AI Notebook</h1>
        </div>
        <p className="text-slate-400 mb-8">
          Sign in with Google to back up your notes and sync across devices.
        </p>
        <div className="flex justify-center">
          <div ref={signInButtonRef} id="google-signin-button"></div>
        </div>
         <p className="text-xs text-slate-600 mt-8">
            Your notes are saved locally. Signing in is optional but recommended for backup.
        </p>
      </div>
    </div>
  );
};
