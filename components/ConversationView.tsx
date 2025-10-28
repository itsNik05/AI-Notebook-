
import React, { useEffect, useRef } from 'react';
import { useLiveConversation } from '../hooks/useLiveConversation';
import { MicIcon, SaveIcon, XIcon, LoaderIcon, AlertTriangleIcon } from './icons';

interface ConversationViewProps {
  onClose: () => void;
  onSave: (transcript: string) => void;
}

export const ConversationView: React.FC<ConversationViewProps> = ({ onClose, onSave }) => {
  const { status, transcript, startConversation, stopConversation, error } = useLiveConversation();
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const handleSave = () => {
    if (transcript.trim()) {
      onSave(transcript);
    }
  };

  const getStatusIndicator = () => {
    switch (status) {
      case 'idle':
        return <span className="text-slate-400">Tap mic to start</span>;
      case 'connecting':
        return <div className="flex items-center text-yellow-400"><LoaderIcon className="w-4 h-4 mr-2 animate-spin" />Connecting...</div>;
      case 'connected':
        return <span className="text-green-400">Listening...</span>;
      case 'error':
        return <div className="flex items-center text-red-400"><AlertTriangleIcon className="w-4 h-4 mr-2" />Error</div>;
      case 'stopped':
        return <span className="text-slate-400">Conversation ended</span>;
      default:
        return null;
    }
  };

  const isRecording = status === 'connecting' || status === 'connected';

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-lg z-50 flex flex-col p-4 animate-fade-in">
      <div className="flex-shrink-0 flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-cyan-400">Voice Note</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700">
          <XIcon className="w-6 h-6 text-slate-400" />
        </button>
      </div>

      <div className="flex-grow bg-slate-800/50 rounded-lg p-4 overflow-y-auto mb-4 min-h-0">
        <p className="text-slate-300 whitespace-pre-wrap">{transcript}</p>
        <div ref={transcriptEndRef} />
        {error && <p className="text-red-400 mt-4">Error: {error}</p>}
      </div>
      
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className="h-8 mb-4 text-center">{getStatusIndicator()}</div>
        <div className="flex items-center space-x-8">
            <button
                onClick={handleSave}
                disabled={!transcript.trim() || isRecording}
                className="flex items-center justify-center w-16 h-16 bg-slate-700 rounded-full shadow-lg transition-colors enabled:hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <SaveIcon className="w-7 h-7" />
            </button>
            <button
                onClick={isRecording ? stopConversation : startConversation}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-pink-500 hover:bg-pink-600'}`}
            >
                <MicIcon className="w-9 h-9 text-white" />
            </button>
            <div className="w-16 h-16"></div>
        </div>
      </div>
    </div>
  );
};
