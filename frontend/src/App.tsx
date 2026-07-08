import AuroraBackground from './components/AuroraBackground';
import TopicForm from './components/TopicForm';
import AgentPipeline from './components/AgentPipeline';
import ReportViewer from './components/ReportViewer';
import GlassCard from './components/GlassCard';
import { useReportStream } from './hooks/useReportStream';
import { AlertCircle, RotateCcw, Compass } from 'lucide-react';

function App() {
  const {
    isLoading,
    isStreaming,
    reportContent,
    error,
    pipeline,
    startStream,
    resetStream,
  } = useReportStream();

  // Check if pipeline has started running (any agent is active or completed)
  const isPipelineActive = Object.values(pipeline).some(
    (agent) => agent.status !== 'idle'
  );

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-between pb-12">
      {/* Dynamic Aurora Glow Layers */}
      <AuroraBackground />

      {/* Main Container */}
      <main className="w-full max-w-6xl px-4 md:px-8 mt-12 md:mt-20 flex-1 flex flex-col gap-8">
        
        {/* Header Hero Section */}
        <header className="text-center flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-champagne/40 border border-glass-border rounded-full text-xs font-mono uppercase tracking-wider text-umber-text/80 shadow-sm animate-fade-in">
            <Compass size={14} className="text-aurora-gold animate-spin-slow" />
            AI Orchestration Crew
          </div>
          
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-umber-text mb-2">
            Aurora{' '}
            <span className="bg-gradient-to-r from-aurora-gold via-amber-glow to-aurora-gold bg-clip-text text-transparent drop-shadow-sm font-bold">
              Research
            </span>
          </h1>
          
          <p className="text-sm md:text-base text-taupe-muted max-w-xl leading-relaxed">
            A collaborative multi-agent collective that researches web sources, validates claims, and drafts premium reports.
          </p>
        </header>

        {/* Input Form & Error Display */}
        <section className="w-full">
          {!isPipelineActive ? (
            <TopicForm onSubmit={startStream} isLoading={isLoading} />
          ) : (
            <div className="flex justify-center mb-4">
              <button
                onClick={resetStream}
                className="flex items-center gap-1.5 px-4 py-2 bg-glass-bg hover:bg-glass-bg-hover border border-glass-border text-umber-text text-xs font-semibold rounded-xl transition-all duration-300 shadow-sm cursor-pointer hover:shadow-md active:scale-95"
              >
                <RotateCcw size={14} />
                Research Another Topic
              </button>
            </div>
          )}

          {error && (
            <GlassCard className="p-4 max-w-2xl mx-auto border-red-300 bg-red-50/20 text-red-800 flex items-start gap-3 mt-4">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <div className="text-sm">
                <span className="font-semibold">Error:</span> {error}
              </div>
            </GlassCard>
          )}
        </section>

        {/* Agent Orchestration Pipeline */}
        {isPipelineActive && (
          <section className="w-full">
            <GlassCard className="p-6 md:p-8">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-taupe-muted mb-6 text-center">
                Agent Status & Hand-Off Pipeline
              </h2>
              <AgentPipeline pipeline={pipeline} />
            </GlassCard>
          </section>
        )}

        {/* Generated Report Output */}
        <section className="w-full">
          <ReportViewer content={reportContent} isStreaming={isStreaming} />
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-taupe-muted/70 tracking-wide font-mono">
        &copy; {new Date().getFullYear()} AURORA RESEARCH LABS &bull; POWERED BY CREWAI
      </footer>
    </div>
  );
}

export default App;
