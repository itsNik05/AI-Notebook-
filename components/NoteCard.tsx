import React, { useState } from 'react';
import { Note } from '../types';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import { Volume2Icon, Trash2Icon, LoaderIcon, EditIcon } from './icons';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onEdit: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete, onEdit }) => {
  const [isReading, setIsReading] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const handleReadAloud = async () => {
    if (isReading) return;
    setIsReading(true);

    try {
      const base64Audio = await generateSpeech(note.content);
      if (base64Audio) {
        // Fix for 'webkitAudioContext' not being on the window type.
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        setAudioContext(ctx);

        const decodedData = decode(base64Audio);
        const audioBuffer = await decodeAudioData(decodedData, ctx, 24000, 1);
        
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
        source.onended = () => {
          setIsReading(false);
          ctx.close();
        };
      }
    } catch (error) {
      console.error('Error generating or playing speech:', error);
      alert('Failed to read note aloud.');
      setIsReading(false);
    }
  };

  const formattedDate = new Date(note.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-4 flex flex-col justify-between transition-all hover:shadow-cyan-500/20 hover:border-cyan-500/50 border border-transparent">
      <div>
        <h2 className="text-lg font-semibold text-cyan-400 mb-2">{note.title}</h2>
        <p className="text-slate-300 whitespace-pre-wrap text-sm mb-4">{note.content}</p>
      </div>
      <div className="flex justify-between items-center mt-2 border-t border-slate-700 pt-3">
        <p className="text-xs text-slate-500">{formattedDate}</p>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReadAloud}
            disabled={isReading}
            className="text-slate-400 hover:text-cyan-400 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
            aria-label="Read note aloud"
          >
            {isReading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <Volume2Icon className="w-5 h-5" />}
          </button>
          <button 
            onClick={onEdit} 
            className="text-slate-400 hover:text-green-400 transition-colors"
            aria-label="Edit note"
          >
            <EditIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onDelete(note.id)} 
            className="text-slate-400 hover:text-pink-500 transition-colors"
            aria-label="Delete note"
          >
            <Trash2Icon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
