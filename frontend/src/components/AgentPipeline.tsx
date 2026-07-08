import React from 'react';
import { AgentNode } from './AgentNode';
import type { PipelineState } from '../types';

interface AgentPipelineProps {
  pipeline: PipelineState;
}

export const AgentPipeline: React.FC<AgentPipelineProps> = ({ pipeline }) => {
  // Determine progress percentage for the SVG connecting line
  const getProgressWidth = () => {
    if (pipeline.editor.status === 'done') return '100%';
    if (pipeline.editor.status === 'running') return '87.5%';
    if (pipeline.writer.status === 'done') return '75%';
    if (pipeline.writer.status === 'running') return '62.5%';
    if (pipeline.fact_checker.status === 'done') return '50%';
    if (pipeline.fact_checker.status === 'running') return '37.5%';
    if (pipeline.researcher.status === 'done') return '25%';
    if (pipeline.researcher.status === 'running') return '12.5%';
    return '0%';
  };

  return (
    <div className="w-full py-6 relative">
      {/* Desktop Connection Line */}
      <div className="hidden md:block absolute top-[60px] left-[12%] right-[12%] h-[3px] bg-taupe-muted/20 -z-10 rounded-full overflow-hidden">
        {/* Active flowing gold thread */}
        <div
          className="h-full bg-gradient-to-r from-aurora-gold via-amber-glow to-aurora-gold transition-all duration-1000 ease-in-out relative"
          style={{ width: getProgressWidth() }}
        >
          {/* Animated flowing pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.6)_50%,transparent_100%)] bg-[length:30px_100%] animate-flow-dash" />
        </div>
      </div>

      {/* Mobile Connection Line */}
      <div className="md:hidden absolute left-[44px] top-[40px] bottom-[40px] w-[3px] bg-taupe-muted/20 -z-10 rounded-full overflow-hidden">
        {/* Active flowing gold thread */}
        <div
          className="w-full bg-gradient-to-b from-aurora-gold via-amber-glow to-aurora-gold transition-all duration-1000 ease-in-out relative"
          style={{ height: getProgressWidth() }}
        >
          {/* Animated flowing pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.6)_50%,transparent_100%)] bg-[length:100%_30px] animate-flow-dash" />
        </div>
      </div>

      {/* Pipeline Nodes Wrapper */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4 px-4">
        <AgentNode
          label="Research Agent"
          status={pipeline.researcher.status}
          detail={pipeline.researcher.detail}
          modelInfo="groq / llama-3.3-70b"
          iconType="researcher"
        />
        
        <AgentNode
          label="Fact-Checker Agent"
          status={pipeline.fact_checker.status}
          detail={pipeline.fact_checker.detail}
          modelInfo="openrouter / deepseek-r1"
          iconType="fact_checker"
        />
        
        <AgentNode
          label="Writer Agent"
          status={pipeline.writer.status}
          detail={pipeline.writer.detail}
          modelInfo="nim / llama-3.1-70b"
          iconType="writer"
        />
        
        <AgentNode
          label="Editor Agent"
          status={pipeline.editor.status}
          detail={pipeline.editor.detail}
          modelInfo="groq / llama-3.3-70b"
          iconType="editor"
        />
      </div>
    </div>
  );
};

export default AgentPipeline;
