import React, { useState, useEffect } from 'react';
import { Note } from './types';
import { Header } from './components/Header';
import { NoteCard } from './components/NoteCard';
import { ConversationView } from './components/ConversationView';
import { NewNoteView } from './components/NewNoteView';
import { EditNoteView } from './components/EditNoteView';
import { LoginView } from './components/LoginView';
import { PlusIcon, MicIcon, SearchIcon, XIcon } from './components/icons';

type View = 'list' | 'voice' | 'new_note' | 'edit_note';

interface UserProfile {
  sub: string;
  name: string;
  picture: string;
  email: string;
}

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [view, setView] = useState<View>('list');
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  const guestNotesKey = 'ai-notebook-notes-guest';
  const notesKey = user ? `ai-notebook-notes-${user.sub}` : guestNotesKey;

  // Load initial notes for guest user on first mount
  useEffect(() => {
    try {
      const storedNotes = localStorage.getItem(guestNotesKey);
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      } else {
        // Set initial welcome notes for new users
        setNotes([
          { id: '1', title: 'Welcome!', content: 'This is your first note. Use the + button to add more notes or start a voice conversation.', createdAt: new Date().toISOString() },
          { id: '2', title: 'Features', content: 'You can create notes with AI assistance, dictate notes with your voice, have your notes read back to you, and edit them by clicking the pencil icon.', createdAt: new Date().toISOString() }
        ]);
      }
    } catch (error) {
      console.error("Failed to load guest notes from localStorage", error);
      setNotes([]);
    }
  }, []); // Only runs on initial mount

  // Save notes to localStorage whenever they change for the current user (or guest).
  useEffect(() => {
    try {
      if (notes.length > 0) {
        localStorage.setItem(notesKey, JSON.stringify(notes));
      } else if (localStorage.getItem(notesKey)) {
        // If notes are empty, remove from storage to avoid storing an empty array
        localStorage.removeItem(notesKey);
      }
    } catch (error) {
      console.error("Failed to save notes to localStorage", error);
    }
  }, [notes, notesKey]);

  const handleLogin = (credentialResponse: any) => {
    try {
      const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      const loggedInUser: UserProfile = {
        sub: payload.sub,
        name: payload.name,
        picture: payload.picture,
        email: payload.email,
      };

      // Notes currently in state are the guest notes. Filter out default welcome notes before merging.
      const guestNotes = notes.filter(note => !(note.id === '1' || note.id === '2'));

      // Load notes for the logged-in user from their own storage
      const userNotesKey = `ai-notebook-notes-${loggedInUser.sub}`;
      const storedUserNotesString = localStorage.getItem(userNotesKey);
      const storedUserNotes = storedUserNotesString ? JSON.parse(storedUserNotesString) : [];

      // Merge guest notes with the user's stored notes, ensuring no duplicates
      const combinedNotes = [...storedUserNotes, ...guestNotes];
      const uniqueNotes = Array.from(new Map(combinedNotes.map(note => [note.id, note])).values());
      
      setNotes(uniqueNotes);
      setUser(loggedInUser);
      setShowLogin(false); // Close the login view
      
      // Clean up guest notes from local storage as they are now merged
      localStorage.removeItem(guestNotesKey);

    } catch (error) {
      console.error("Failed to process login or merge notes:", error);
    }
  };
  
  const handleLogout = () => {
    setUser(null);
    // After logout, load any existing guest notes. If none, show welcome notes.
    try {
      const storedNotes = localStorage.getItem(guestNotesKey);
      setNotes(storedNotes ? JSON.parse(storedNotes) : [
        { id: '1', title: 'Welcome!', content: 'This is your first note. Use the + button to add more notes or start a voice conversation.', createdAt: new Date().toISOString() },
        { id: '2', title: 'Features', content: 'You can create notes with AI assistance, dictate notes with your voice, have your notes read back to you, and edit them by clicking the pencil icon.', createdAt: new Date().toISOString() }
      ]);
    } catch (error) {
       console.error("Failed to load guest notes after logout", error);
       setNotes([]);
    }
  };

  const addNote = (content: string, title?: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: title || `Note ${new Date().toLocaleDateString()}`,
      content,
      createdAt: new Date().toISOString(),
    };
    setNotes(prevNotes => [newNote, ...prevNotes]);
  };

  const updateNote = (id: string, content: string, title: string) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id ? { ...note, title, content, createdAt: new Date().toISOString() } : note
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  };
  
  const openView = (newView: View) => {
    setView(newView);
    setIsFabMenuOpen(false);
  }

  const handleStartEdit = (note: Note) => {
    setEditingNote(note);
    setView('edit_note');
  }

  return (
    <div className="min-h-screen font-sans text-white bg-slate-900 flex flex-col">
      <Header user={user} onLogout={handleLogout} onLoginClick={() => setShowLogin(true)} />
      
      {showLogin && <LoginView onLogin={handleLogin} onClose={() => setShowLogin(false)} />}

      <main className="flex-grow p-4 pt-20 pb-24 relative">
        {notes.length === 0 && view === 'list' ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
            <p className="text-lg">No notes yet.</p>
            <p>Tap the '+' button to get started.</p>
          </div>
        ) : (
          view === 'list' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map(note => (
                <NoteCard key={note.id} note={note} onDelete={deleteNote} onEdit={() => handleStartEdit(note)} />
              ))}
            </div>
          )
        )}
      </main>

      {view === 'voice' && (
        <ConversationView 
          onClose={() => setView('list')} 
          onSave={(transcript) => {
            addNote(transcript, 'Voice Note');
            setView('list');
          }} 
        />
      )}

      {view === 'new_note' && (
        <NewNoteView
          onClose={() => setView('list')}
          onSave={(noteContent, noteTitle) => {
            addNote(noteContent, noteTitle);
            setView('list');
          }}
        />
      )}

      {view === 'edit_note' && editingNote && (
        <EditNoteView
          note={editingNote}
          onClose={() => {
            setView('list');
            setEditingNote(null);
          }}
          onSave={(id, content, title) => {
            updateNote(id, content, title);
            setView('list');
            setEditingNote(null);
          }}
        />
      )}

      {view === 'list' && (
        <div className="fixed bottom-6 right-6 z-40">
          {isFabMenuOpen && (
            <div className="flex flex-col items-center mb-4 space-y-3">
              <button onClick={() => openView('new_note')} className="flex items-center justify-center w-14 h-14 bg-indigo-500 rounded-full shadow-lg hover:bg-indigo-600 transition-transform transform hover:scale-110">
                <SearchIcon className="w-6 h-6" />
              </button>
              <button onClick={() => openView('voice')} className="flex items-center justify-center w-14 h-14 bg-pink-500 rounded-full shadow-lg hover:bg-pink-600 transition-transform transform hover:scale-110">
                <MicIcon className="w-6 h-6" />
              </button>
            </div>
          )}
          <button 
            onClick={() => setIsFabMenuOpen(!isFabMenuOpen)} 
            className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center text-white shadow-2xl hover:bg-cyan-600 focus:outline-none focus:ring-4 focus:ring-cyan-300/50 transition-transform transform hover:rotate-45"
          >
            {isFabMenuOpen ? <XIcon className="w-8 h-8 transition-transform transform" /> : <PlusIcon className="w-8 h-8 transition-transform transform" />}
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
