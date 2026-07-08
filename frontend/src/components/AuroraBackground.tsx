import React from 'react';

export const AuroraBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-base-white">
      {/* Aurora blob 1 - Gold */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-aurora-gold/25 blur-[80px] md:blur-[120px] animate-aurora-1" />
      
      {/* Aurora blob 2 - Amber/Glow */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-amber-glow/20 blur-[100px] md:blur-[150px] animate-aurora-2" />
      
      {/* Aurora blob 3 - Champagne/Beige */}
      <div className="absolute top-[30%] right-[20%] w-[45vw] h-[45vw] rounded-full bg-champagne/50 blur-[90px] md:blur-[130px] animate-aurora-3" />
      
      {/* Aurora blob 4 - Soft gold glow center */}
      <div className="absolute top-[15%] left-[40%] w-[35vw] h-[35vw] rounded-full bg-aurora-gold/15 blur-[90px] animate-aurora-1" />
    </div>
  );
};

export default AuroraBackground;
