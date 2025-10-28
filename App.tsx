
import React, { useState, useEffect } from 'react';
import { Note } from './types';
import { Header } from './components/Header';
import { NoteCard } from './components/NoteCard';
import { ConversationView } from './components/ConversationView';
import { NewNoteView } from './components/NewNoteView';
import { EditNoteView } from './components/EditNoteView';
import { PlusIcon, MicIcon, SearchIcon, XIcon } from './components/icons';

type View = 'list' | 'voice' | 'new_note' | 'edit_note';

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [view, setView] = useState<View>('list');
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    // Load notes from localStorage on initial render
    try {
      const storedNotes = localStorage.getItem('ai-notebook-notes');
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      } else {
         setNotes([
          { id: '1', title: 'Welcome!', content: 'This is your first note. Use the + button to add more notes or start a voice conversation.', createdAt: new Date().toISOString() },
          { id: '2', title: 'Features', content: 'You can create notes with AI assistance, dictate notes with your voice, have your notes read back to you, and edit them by clicking the pencil icon.', createdAt: new Date().toISOString() }
        ]);
      }
    } catch (error) {
      console.error("Failed to load notes from localStorage", error);
    }
  }, []);

  useEffect(() => {
    // Save notes to localStorage whenever they change
    try {
      localStorage.setItem('ai-notebook-notes', JSON.stringify(notes));
    } catch (error) {
      console.error("Failed to save notes to localStorage", error);
    }
  }, [notes]);

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
      <Header />
      <main className="flex-grow p-4 pt-20 pb-24 relative">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <p className="text-lg">No notes yet.</p>
            <p>Tap the '+' button to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map(note => (
              <NoteCard key={note.id} note={note} onDelete={deleteNote} onEdit={() => handleStartEdit(note)} />
            ))}
          </div>
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
    </div>
  );
};

export default App;
