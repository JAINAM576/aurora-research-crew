import React from 'react';

export const AuroraBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-base-white">
      {/* Aurora blob 1 - Gold */}
      <div className="absolute top-[-15%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-aurora-gold/25 blur-[100px] md:blur-[140px] animate-aurora-1" />
      
      {/* Aurora blob 2 - Amber/Glow */}
      <div className="absolute bottom-[-15%] right-[-15%] w-[70vw] h-[70vw] rounded-full bg-amber-glow/20 blur-[120px] md:blur-[160px] animate-aurora-2" />
      
      {/* Aurora blob 3 - Champagne/Beige */}
      <div className="absolute top-[20%] right-[10%] w-[55vw] h-[55vw] rounded-full bg-champagne/50 blur-[110px] md:blur-[150px] animate-aurora-3" />
      
      {/* Aurora blob 4 - Soft gold glow center */}
      <div className="absolute top-[10%] left-[30%] w-[45vw] h-[45vw] rounded-full bg-aurora-gold/15 blur-[100px] animate-aurora-1" />
    </div>
  );
};

export default AuroraBackground;
