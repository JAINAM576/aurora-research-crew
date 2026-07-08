import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-glass-bg
        backdrop-blur-[20px]
        saturate-[140%]
        border border-glass-border
        rounded-[24px]
        shadow-[0_8px_32px_rgba(0,0,0,0.06)]
        transition-all duration-300
        ${onClick ? 'cursor-pointer hover:bg-glass-bg-hover hover:border-aurora-gold/40 hover:shadow-[0_8px_32px_rgba(212,168,83,0.15)] hover:-translate-y-0.5' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default GlassCard;
