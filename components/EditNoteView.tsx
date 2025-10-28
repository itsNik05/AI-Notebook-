
import React, { useState } from 'react';
import { Note } from '../types';
import { generateGroundedResponse } from '../services/geminiService';
import { XIcon, SparklesIcon, LoaderIcon } from './icons';

interface EditNoteViewProps {
  note: Note;
  onClose: () => void;
  onSave: (id: string, content: string, title: string) => void;
}

export const EditNoteView: React.FC<EditNoteViewProps> = ({ note, onClose, onSave }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<{ uri: string; title: string }[]>([]);

  const handleAskAI = async () => {
    if (!query) return;
    setIsLoading(true);
    setSources([]);
    try {
      const response = await generateGroundedResponse(query);
      const newContent = `${content}\n\n## AI Research: ${query}\n\n${response.text}`;
      setContent(newContent);

      const webSources = response.groundingMetadata
        ?.flatMap(meta => meta.groundingChunks)
        .map(chunk => chunk.web)
        .filter(web => web?.uri && web.title);

      if(webSources) {
        setSources(webSources as {uri: string; title: string}[]);
      }
      
      setQuery('');
    } catch (error) {
      console.error("Error with AI search:", error);
      setContent(content + '\n\nFailed to get AI response.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (content.trim()) {
      onSave(note.id, content, title || 'Untitled Note');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-lg z-50 flex flex-col p-4 animate-fade-in">
      <div className="flex-shrink-0 flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-cyan-400">Edit Note</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700">
          <XIcon className="w-6 h-6 text-slate-400" />
        </button>
      </div>

      <div className="flex-grow flex flex-col min-h-0">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 mb-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing your note here..."
          className="w-full flex-grow bg-slate-800 border border-slate-700 rounded-md p-2 text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        {sources.length > 0 && (
            <div className="mt-2 p-2 bg-slate-800/50 rounded-md">
                <h3 className="text-sm font-semibold text-slate-400 mb-1">Sources:</h3>
                <ul className="flex flex-wrap gap-2">
                    {sources.map((source, index) => (
                        <li key={index}>
                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs bg-slate-700 text-cyan-300 px-2 py-1 rounded-full hover:bg-slate-600 transition-colors">
                                {source.title}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>

      <div className="flex-shrink-0 mt-4">
        <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-md p-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
            placeholder="Ask AI with Google Search..."
            className="w-full bg-transparent p-2 text-white placeholder-slate-500 focus:outline-none"
            disabled={isLoading}
          />
          <button onClick={handleAskAI} disabled={isLoading || !query} className="bg-indigo-500 text-white p-2 rounded-md hover:bg-indigo-600 disabled:bg-slate-600 disabled:cursor-not-allowed">
            {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
          </button>
        </div>
        <button onClick={handleSave} disabled={!content.trim()} className="w-full bg-cyan-500 text-white font-bold py-3 mt-4 rounded-md hover:bg-cyan-600 disabled:bg-slate-700 disabled:cursor-not-allowed">
          Save Changes
        </button>
      </div>
    </div>
  );
};
