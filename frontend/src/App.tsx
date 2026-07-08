import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';
import AuroraBackground from './components/AuroraBackground';
import TopicForm from './components/TopicForm';
import AgentPipeline from './components/AgentPipeline';
import ReportViewer from './components/ReportViewer';
import GlassCard from './components/GlassCard';
import AuthScreen from './components/AuthScreen';
import Profile from './components/Profile';
import History from './components/History';
import { useReportStream } from './hooks/useReportStream';
import { AlertCircle, RotateCcw, History as HistoryIcon, User, LogOut, LayoutDashboard, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

type PageState = 'dashboard' | 'history' | 'profile';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activePage, setActivePage] = useState<PageState>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

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

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // 2. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isPipelineActive && isLoading) {
      const startTime = Date.now();
      intervalId = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
      }, 100);
    } else if (!isPipelineActive) {
      setElapsedTime(0);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPipelineActive, isLoading]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    resetStream();
    setActivePage('dashboard');
  };

  // Authentication Guard Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <AuroraBackground />
        <div className="w-10 h-10 border-4 border-aurora-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not Logged In -> Render Login/Register Form
  if (!session) {
    return (
      <>
        <AuroraBackground />
        <AuthScreen />
      </>
    );
  }

  // Nav item helper
  const navItem = (page: PageState, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => {
        setActivePage(page);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out cursor-pointer rounded-xl border border-transparent will-change-transform ${
        isSidebarCollapsed 
          ? 'flex-col gap-1.5 py-2 px-1 text-[9px] font-bold uppercase tracking-wider justify-center items-center text-center' 
          : 'flex-row gap-3 px-4 py-2.5 text-sm font-medium tracking-wide justify-start items-center'
      } ${
        activePage === page
          ? 'bg-aurora-gold/15 border-aurora-gold/30 text-aurora-gold shadow-sm shadow-aurora-gold/5'
          : 'text-umber-text/65 hover:text-umber-text hover:bg-glass-bg-hover/80 hover:shadow-sm hover:shadow-black/5 hover:translate-x-0.5'
      }`}
    >
      <div className="shrink-0">
        {icon}
      </div>
      <span className="truncate max-w-full leading-none">
        {label === 'Report History' && isSidebarCollapsed ? 'History' : label}
      </span>
    </button>
  );

  // Logged In -> Render Main Dashboard App Layout
  return (
    <div className="min-h-screen relative flex flex-col md:flex-row select-none">
      {/* Background aurora gradients */}
      <AuroraBackground />

      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-glass-bg backdrop-blur-[20px] border-b border-glass-border shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-aurora-gold to-amber-glow flex items-center justify-center text-white font-display font-bold text-sm shadow-sm shadow-aurora-gold/15">
            A
          </div>
          <h1 className="font-display text-base font-bold tracking-tight text-umber-text leading-none">
            Aurora
          </h1>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 hover:bg-glass-bg-hover rounded-xl text-umber-text transition-all duration-200 cursor-pointer"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Mobile Sidebar Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/15 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation - Responsive Drawer/Collapsible layout with Hover interaction */}
      <aside 
        onMouseEnter={() => setIsSidebarCollapsed(false)}
        onMouseLeave={() => setIsSidebarCollapsed(true)}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-glass-bg backdrop-blur-[30px] saturate-[140%] border-r border-glass-border flex flex-col justify-between py-6 transition-[width,padding,transform,background-color,border-color,box-shadow] duration-300 ease-out transform md:translate-x-0 md:relative md:h-screen md:sticky md:top-0 overflow-y-auto ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isSidebarCollapsed ? 'md:w-20 md:px-3' : 'md:w-60 md:px-4 px-4'}`}
      >
        <div>
          {/* Brand header in Sidebar */}
          <div className={`flex items-center justify-between mb-8 transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-2'}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-aurora-gold to-amber-glow flex items-center justify-center text-white font-display font-bold text-base shadow-md shadow-aurora-gold/20 shrink-0">
                A
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <h1 className="font-display text-lg font-bold tracking-tight text-umber-text leading-none">
                    Aurora
                  </h1>
                  <p className="text-[9px] text-taupe-muted font-mono tracking-[0.2em] uppercase mt-0.5">
                    Research Labs
                  </p>
                </div>
              )}
            </div>
            
            {/* Close Menu Button (Mobile Only) */}
            <div className="flex items-center shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden p-2 hover:bg-glass-bg-hover rounded-xl text-umber-text transition-colors duration-200 ease-out cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItem('dashboard', <LayoutDashboard size={18} />, 'Dashboard')}
            {navItem('history', <HistoryIcon size={18} />, 'Report History')}
            {navItem('profile', <User size={18} />, 'Profile')}
          </nav>
        </div>

        {/* User footer */}
        <div className={`pt-4 border-t border-glass-border mt-6 md:mt-0 transition-all duration-300 ${isSidebarCollapsed ? 'px-0 flex flex-col items-center gap-3' : 'px-2'}`}>
          <div className={`flex items-center gap-3 transition-all duration-300 ${isSidebarCollapsed ? 'mb-0 justify-center' : 'mb-3'}`}>
            <div className="w-8 h-8 rounded-xl bg-aurora-gold/15 border border-aurora-gold/20 flex items-center justify-center font-display text-sm font-bold text-aurora-gold shrink-0">
              {session.user.email ? session.user.email[0].toUpperCase() : 'U'}
            </div>
            {!isSidebarCollapsed && (
              <div className="truncate flex-1 min-w-0">
                <p className="text-xs font-semibold text-umber-text truncate leading-none">
                  {session.user.user_metadata?.full_name || 'Active User'}
                </p>
                <p className="text-[10px] text-taupe-muted truncate mt-0.5">
                  {session.user.email}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`flex items-center rounded-xl transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out cursor-pointer ${
              isSidebarCollapsed 
                ? 'p-2 hover:bg-red-500/10 text-red-500/70 hover:text-red-500 hover:shadow-sm hover:shadow-red-500/5 hover:scale-[1.02]' 
                : 'w-full gap-2.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-red-500/70 hover:text-red-500 hover:bg-red-500/8 hover:shadow-sm hover:shadow-red-500/5 hover:translate-x-0.5'
            }`}
            title={isSidebarCollapsed ? "Sign Out" : undefined}
          >
            <LogOut size={isSidebarCollapsed ? 16 : 14} />
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <main className={`w-full px-6 md:px-12 py-8 md:py-12 flex-1 flex flex-col gap-8 ${activePage === 'profile' ? 'max-w-none mx-0' : 'max-w-5xl mx-auto'}`}>
          {activePage === 'dashboard' && (
            <>
              {/* Header Hero Section */}
              <header className="text-center flex flex-col items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/30 border border-glass-border rounded-full text-[10px] font-mono uppercase tracking-widest text-umber-text/70 shadow-sm animate-fade-in">
                  <span className="w-1.5 h-1.5 rounded-full bg-aurora-gold animate-pulse" />
                  4 agents · live search · verified sources
                </div>
                
                <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-umber-text">
                  Aurora{' '}
                  <span className="bg-gradient-to-r from-aurora-gold via-amber-glow to-aurora-gold bg-clip-text text-transparent font-bold">
                    Research
                  </span>
                </h1>
                
                <p className="text-sm text-taupe-muted max-w-lg leading-relaxed">
                  A collaborative multi-agent collective that researches web sources, validates claims, and drafts premium reports.
                </p>
              </header>

              {/* Input Form & Error Display */}
              <section className="w-full">
                {!isPipelineActive ? (
                  <TopicForm
                    onSubmit={(topic) => startStream(topic, session.access_token)}
                    isLoading={isLoading}
                  />
                ) : (
                  <div className="flex justify-center mb-4">
                    <button
                      onClick={resetStream}
                      className="flex items-center gap-2 px-4 py-2 bg-glass-bg hover:bg-glass-bg-hover border border-glass-border text-umber-text/80 hover:text-umber-text text-xs font-semibold rounded-xl transition-all duration-200 shadow-sm cursor-pointer active:scale-[0.98]"
                    >
                      <RotateCcw size={14} />
                      Research Another Topic
                    </button>
                  </div>
                )}

                {error && (
                  <GlassCard className="p-4 max-w-2xl mx-auto border-red-300/30 flex items-start gap-3 mt-4">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                    <div className="text-sm text-red-600">
                      <span className="font-semibold">Error:</span> {error}
                    </div>
                  </GlassCard>
                )}
              </section>

              {/* Agent Orchestration Pipeline - Always visible */}
              <section className="w-full animate-fade-in">
                <GlassCard className="p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row items-center justify-between border-b border-glass-border pb-4 mb-6">
                    <h2 className="text-[10px] font-mono font-semibold uppercase tracking-widest text-taupe-muted text-center sm:text-left">
                      Agent Orchestration Pipeline
                    </h2>
                    {elapsedTime > 0 && (
                      <div className="mt-2 sm:mt-0 px-2.5 py-0.5 bg-aurora-gold/10 border border-aurora-gold/20 text-aurora-gold text-[10px] font-mono font-semibold rounded-full flex items-center gap-1.5 shadow-sm shadow-aurora-gold/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-aurora-gold animate-pulse" />
                        Time Elapsed: {elapsedTime.toFixed(1)}s
                      </div>
                    )}
                  </div>
                  <AgentPipeline pipeline={pipeline} />
                </GlassCard>
              </section>

              {/* Generated Report Output */}
              <section className="w-full select-text">
                <ReportViewer content={reportContent} isStreaming={isStreaming} />
              </section>
            </>
          )}

          {activePage === 'history' && <History />}

          {activePage === 'profile' && <Profile />}
        </main>

        {/* Footer */}
        <footer className="py-5 text-center text-[10px] text-taupe-muted/60 tracking-widest font-mono uppercase border-t border-glass-border/30 select-none">
          &copy; {new Date().getFullYear()} Aurora Research Labs &bull; Powered by CrewAI
        </footer>
      </div>
    </div>
  );
}

export default App;
