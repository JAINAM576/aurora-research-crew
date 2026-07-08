import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import GlassCard from './GlassCard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Download, Trash2, RefreshCw, FileText, X } from 'lucide-react';

interface Report {
  id: string;
  topic: string;
  status: 'running' | 'completed' | 'failed';
  content: string;
  created_at: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default function History() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session found');

      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve history');
      }

      const data = await response.json();
      setReports(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred fetching history.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this report from your history?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session found');

      const response = await fetch(`${API_BASE_URL}/api/reports/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete report');
      }

      setReports(reports.filter(r => r.id !== id));
      if (selectedReport?.id === id) {
        setSelectedReport(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete report.');
    }
  };

  const downloadMarkdown = (report: Report, e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([report.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.topic.toLowerCase().replace(/\s+/g, '_')}_report.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600',
      running: 'bg-aurora-gold/10 border-aurora-gold/20 text-aurora-gold animate-pulse',
      failed: 'bg-red-500/10 border-red-500/20 text-red-600',
    };
    return styles[status as keyof typeof styles] || styles.failed;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-aurora-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-display text-3xl font-semibold text-umber-text">Report History</h2>
          <p className="text-sm text-taupe-muted mt-1">Access and download your previously generated research reports.</p>
        </div>
        <button
          onClick={fetchHistory}
          className="flex items-center gap-2 px-4 py-2 bg-glass-bg hover:bg-glass-bg-hover border border-glass-border text-umber-text/80 hover:text-umber-text rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm font-medium mb-6">
          {error}
        </div>
      )}

      {/* Empty State */}
      {reports.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <FileText className="mx-auto mb-3 text-taupe-muted/40" size={40} />
          <p className="text-taupe-muted text-sm">No research reports found. Start a new topic in the dashboard!</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.map((report) => (
            <GlassCard
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="p-5 cursor-pointer flex flex-col justify-between h-[180px] group relative"
            >
              <div>
                <div className="flex justify-between items-start gap-3 mb-2">
                  <h3 className="font-display text-base font-bold text-umber-text truncate flex-1 group-hover:text-aurora-gold transition-colors duration-200">
                    {report.topic}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border shrink-0 ${getStatusBadge(report.status)}`}>
                    {report.status}
                  </span>
                </div>
                <p className="text-[11px] text-taupe-muted">
                  {new Date(report.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-glass-border mt-auto">
                <span className="text-xs text-aurora-gold font-semibold group-hover:underline">
                  View Report →
                </span>
                <div className="flex gap-1.5">
                  {report.status === 'completed' && (
                    <button
                      onClick={(e) => downloadMarkdown(report, e)}
                      className="p-1.5 hover:bg-white/50 rounded-lg text-taupe-muted hover:text-umber-text transition-all duration-200"
                      title="Download Markdown"
                    >
                      <Download size={14} />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDelete(report.id, e)}
                    className="p-1.5 hover:bg-red-500/10 rounded-lg text-taupe-muted hover:text-red-500 transition-all duration-200"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Expanded Report Reader Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-4xl max-h-[85vh] bg-base-white/95 backdrop-blur-xl border border-glass-border rounded-[24px] shadow-2xl overflow-hidden flex flex-col relative select-text">
            {/* Modal Header */}
            <div className="p-6 border-b border-glass-border flex justify-between items-center shrink-0">
              <div className="min-w-0 flex-1 mr-4">
                <h3 className="font-display text-xl font-bold text-umber-text truncate">{selectedReport.topic}</h3>
                <p className="text-[11px] text-taupe-muted mt-1">
                  Generated on {new Date(selectedReport.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                {selectedReport.status === 'completed' && (
                  <button
                    onClick={(e) => downloadMarkdown(selectedReport, e)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-aurora-gold hover:bg-aurora-gold/90 text-white font-semibold rounded-xl text-xs shadow-[0_4px_12px_rgba(212,168,83,0.25)] transition-all duration-200 cursor-pointer"
                  >
                    <Download size={14} />
                    Download
                  </button>
                )}
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 hover:bg-glass-bg-hover rounded-xl text-taupe-muted hover:text-umber-text transition-all duration-200 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-8 overflow-y-auto prose prose-stone max-w-none text-left">
              {selectedReport.status === 'running' ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-8 h-8 border-4 border-aurora-gold border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-taupe-muted">This report is still being generated. Please wait...</p>
                </div>
              ) : selectedReport.status === 'failed' ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-600 font-medium font-mono whitespace-pre-wrap">
                  {selectedReport.content || 'Report generation failed with an unknown error.'}
                </div>
              ) : (
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedReport.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
