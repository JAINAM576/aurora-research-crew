import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Download, FileText, Loader2 } from 'lucide-react';
import GlassCard from './GlassCard';

interface ReportViewerProps {
  content: string;
  isStreaming: boolean;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ content, isStreaming }) => {
  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'research_report.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!content) {
    return null;
  }

  return (
    <GlassCard className="p-6 md:p-8 w-full max-w-4xl mx-auto mt-8 relative overflow-hidden">
      {/* Header bar inside Card */}
      <div className="flex justify-between items-center border-b border-glass-border pb-4 mb-6">
        <div className="flex items-center gap-2">
          <FileText className="text-aurora-gold" size={20} />
          <h2 className="font-display text-xl text-umber-text font-semibold">Research Report</h2>
        </div>
        <div className="flex items-center gap-4">
          {isStreaming && (
            <div className="flex items-center gap-2 text-xs text-taupe-muted">
              <Loader2 size={14} className="animate-spin text-aurora-gold" />
              Streaming...
            </div>
          )}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-white/45 hover:bg-white/70 border border-glass-border text-umber-text rounded-lg transition-all duration-300 shadow-sm cursor-pointer"
          >
            <Download size={14} />
            Download MD
          </button>
        </div>
      </div>

      {/* Render Markdown using custom HTML element components */}
      <div className="markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ ...props }) => <h1 className="font-display text-3xl font-bold text-umber-text mt-8 mb-4 border-b border-glass-border pb-2" {...props} />,
            h2: ({ ...props }) => <h2 className="font-display text-2xl font-semibold text-umber-text mt-6 mb-3" {...props} />,
            h3: ({ ...props }) => <h3 className="font-display text-xl font-medium text-umber-text mt-4 mb-2" {...props} />,
            p: ({ ...props }) => <p className="text-sm md:text-base text-umber-text/95 leading-relaxed mb-4" {...props} />,
            ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1 text-sm md:text-base text-umber-text/95" {...props} />,
            ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-sm md:text-base text-umber-text/95" {...props} />,
            li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
            a: ({ ...props }) => <a className="text-aurora-gold font-semibold underline hover:text-amber-glow transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
            blockquote: ({ ...props }) => <blockquote className="border-l-4 border-aurora-gold/70 pl-4 py-1 my-4 italic bg-champagne/20 rounded-r-lg text-umber-text/90" {...props} />,
            code: ({ className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              const inline = !match;
              return inline ? (
                <code className="font-mono text-xs bg-champagne/50 text-umber-text px-1.5 py-0.5 rounded" {...props}>{children}</code>
              ) : (
                <pre className="font-mono text-xs bg-stone-900 text-stone-100 p-4 rounded-xl overflow-x-auto my-4">
                  <code className={className} {...props}>{children}</code>
                </pre>
              );
            },
            table: ({ ...props }) => (
              <div className="overflow-x-auto my-6 border border-glass-border rounded-xl">
                <table className="min-w-full divide-y divide-glass-border" {...props} />
              </div>
            ),
            thead: ({ ...props }) => <thead className="bg-champagne/30" {...props} />,
            tbody: ({ ...props }) => <tbody className="divide-y divide-glass-border bg-white/20" {...props} />,
            tr: ({ ...props }) => <tr {...props} />,
            th: ({ ...props }) => <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-umber-text" {...props} />,
            td: ({ ...props }) => <td className="px-4 py-3 text-sm text-umber-text/90 whitespace-nowrap" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </GlassCard>
  );
};

export default ReportViewer;
