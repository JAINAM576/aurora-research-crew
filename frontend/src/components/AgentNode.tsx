import React from 'react';
import { Search, ShieldAlert, FileText, Sparkles, Check, Loader2 } from 'lucide-react';
import type { AgentStatus } from '../types';

interface AgentNodeProps {
  label: string;
  status: AgentStatus;
  detail: string;
  modelInfo?: string;
  iconType: 'researcher' | 'fact_checker' | 'writer' | 'editor';
}

export const AgentNode: React.FC<AgentNodeProps> = ({
  label,
  status,
  detail,
  modelInfo,
  iconType,
}) => {
  const getIcon = () => {
    const iconSize = 20;
    switch (iconType) {
      case 'researcher':
        return <Search size={iconSize} />;
      case 'fact_checker':
        return <ShieldAlert size={iconSize} />;
      case 'writer':
        return <FileText size={iconSize} />;
      case 'editor':
        return <Sparkles size={iconSize} />;
    }
  };

  const getStatusStyles = () => {
    switch (status) {
      case 'running':
        return {
          wrapper: 'border-aurora-gold bg-glass-bg shadow-[0_0_15px_rgba(212,168,83,0.3)] scale-105',
          iconContainer: 'bg-aurora-gold text-base-white animate-pulse',
          textColor: 'text-umber-text font-semibold',
          detailColor: 'text-umber-text/90',
        };
      case 'done':
        return {
          wrapper: 'border-aurora-gold/50 bg-white/60',
          iconContainer: 'bg-aurora-gold/20 text-aurora-gold',
          textColor: 'text-umber-text/80',
          detailColor: 'text-taupe-muted',
        };
      case 'error':
        return {
          wrapper: 'border-red-400 bg-red-50/20',
          iconContainer: 'bg-red-500 text-white',
          textColor: 'text-red-800',
          detailColor: 'text-red-700/80',
        };
      case 'idle':
      default:
        return {
          wrapper: 'border-glass-border bg-glass-bg/40 opacity-50',
          iconContainer: 'bg-taupe-muted/20 text-taupe-muted',
          textColor: 'text-taupe-muted',
          detailColor: 'text-taupe-muted/60',
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div
      className={`
        flex flex-col items-center text-center p-5 rounded-2xl border transition-all duration-500 w-full max-w-[240px]
        ${styles.wrapper}
      `}
    >
      {/* Icon with status indicator */}
      <div className="relative mb-3">
        <div
          className={`
            w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
            ${styles.iconContainer}
          `}
        >
          {status === 'done' ? <Check size={18} strokeWidth={3} /> : getIcon()}
        </div>
        
        {/* Status indicator badges */}
        {status === 'running' && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-aurora-gold rounded-full flex items-center justify-center shadow-sm">
            <Loader2 size={10} className="animate-spin text-base-white" />
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className={`text-base font-sans tracking-wide mb-1 ${styles.textColor}`}>
        {label}
      </h3>

      {/* Model Tech Info */}
      {modelInfo && (
        <span className="text-[10px] font-mono uppercase bg-champagne/40 px-1.5 py-0.5 rounded text-taupe-muted mb-2 tracking-wider">
          {modelInfo}
        </span>
      )}

      {/* Details */}
      <p className={`text-xs leading-relaxed line-clamp-3 min-h-[48px] ${styles.detailColor}`}>
        {detail || (status === 'idle' ? 'Awaiting activation' : '')}
      </p>
    </div>
  );
};

export default AgentNode;
