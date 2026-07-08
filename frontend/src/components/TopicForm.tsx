import React, { useState } from 'react';
import { Sparkles, Terminal } from 'lucide-react';
import GlassCard from './GlassCard';

interface TopicFormProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
}

export const TopicForm: React.FC<TopicFormProps> = ({ onSubmit, isLoading }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim().length >= 3) {
      onSubmit(topic.trim());
    }
  };

  return (
    <GlassCard className="p-6 md:p-8 w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="topic-input" className="text-sm font-semibold text-umber-text tracking-wide uppercase flex items-center gap-2">
          <Terminal size={16} className="text-aurora-gold" />
          Research Topic
        </label>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="topic-input"
            type="text"
            placeholder="e.g., Impact of Quantum Computing on Cryptography..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-white/40 border border-glass-border rounded-xl text-umber-text placeholder:text-taupe-muted focus:outline-none focus:ring-2 focus:ring-aurora-gold/50 focus:bg-white/60 transition-all duration-300"
          />
          
          <button
            type="submit"
            disabled={isLoading || topic.trim().length < 3}
            className="px-6 py-3 bg-aurora-gold text-base-white font-semibold rounded-xl hover:bg-aurora-gold/90 focus:outline-none focus:ring-2 focus:ring-aurora-gold/50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(212,168,83,0.2)]"
          >
            <Sparkles size={18} />
            {isLoading ? 'Running Crew...' : 'Initiate Crew'}
          </button>
        </div>
        
        {topic.trim() && topic.trim().length < 3 && (
          <span className="text-xs text-taupe-muted">
            Topic must be at least 3 characters.
          </span>
        )}
      </form>
    </GlassCard>
  );
};

export default TopicForm;
