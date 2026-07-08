import { useState, useCallback, useRef } from 'react';
import type { PipelineState, SSEEvent, AgentId } from '../types';

const initialPipeline: PipelineState = {
  researcher: { status: 'idle', detail: 'Awaiting activation' },
  fact_checker: { status: 'idle', detail: 'Awaiting activation' },
  writer: { status: 'idle', detail: 'Awaiting activation' },
  editor: { status: 'idle', detail: 'Awaiting activation' },
};

export const useReportStream = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pipeline, setPipeline] = useState<PipelineState>(initialPipeline);
  
  // Keep a ref to control cancelling/aborting the stream
  const abortControllerRef = useRef<AbortController | null>(null);

  const resetStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setIsStreaming(false);
    setReportContent('');
    setError(null);
    setPipeline(initialPipeline);
  }, []);

  const startStream = useCallback(async (topic: string, token: string) => {
    resetStream();
    setIsLoading(true);
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    // Hardcoded URL matching the backend location
    const url = 'http://localhost:8000/api/report';
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned error status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body reader not available.');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      
      // Let's set initial statuses to idle
      setPipeline({
        researcher: { status: 'idle', detail: 'Preparing search tools...' },
        fact_checker: { status: 'idle', detail: 'Awaiting research data...' },
        writer: { status: 'idle', detail: 'Awaiting facts check...' },
        editor: { status: 'idle', detail: 'Awaiting final layout...' },
      });

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Save the last element (which might be an incomplete line)
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6).trim();
            if (!dataStr) continue;

            try {
              const event: SSEEvent = JSON.parse(dataStr);
              
              if (event.type === 'status') {
                setPipeline((prev) => ({
                  ...prev,
                  [event.agent]: {
                    status: event.status,
                    detail: event.detail,
                  },
                }));
                
                // If the research agent is done, transition next to idle status
                if (event.agent === 'researcher' && event.status === 'done') {
                  setPipeline((prev) => ({
                    ...prev,
                    fact_checker: { status: 'idle', detail: 'Activating verification routines...' }
                  }));
                }
                
                // Update streaming flags based on which agent is active
                if (event.agent === 'writer' && event.status === 'running') {
                  setIsStreaming(true);
                }
              } 
              
              else if (event.type === 'content') {
                setReportContent((prev) => prev + event.content);
              } 
              
              else if (event.type === 'complete') {
                setIsStreaming(false);
                setIsLoading(false);
              }
            } catch (err) {
              console.error('Error parsing SSE event stream chunk:', err);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream request aborted by client');
        return;
      }
      console.error('SSE Stream error:', err);
      setError(err.message || 'Failed to generate report. Please try again.');
      setIsLoading(false);
      setIsStreaming(false);
      
      // Update any active nodes to error
      setPipeline((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          const agentId = key as AgentId;
          if (updated[agentId].status === 'running') {
            updated[agentId] = { status: 'error', detail: 'Execution interrupted.' };
          }
        });
        return updated;
      });
    }
  }, [resetStream]);

  return {
    isLoading,
    isStreaming,
    reportContent,
    error,
    pipeline,
    startStream,
    resetStream,
  };
};
