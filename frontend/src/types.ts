export type AgentId = 'researcher' | 'fact_checker' | 'writer' | 'editor';

export type AgentStatus = 'idle' | 'running' | 'done' | 'error';

export interface AgentState {
  status: AgentStatus;
  detail: string;
}

export type PipelineState = Record<AgentId, AgentState>;

export interface StatusEvent {
  type: 'status';
  agent: AgentId;
  status: AgentStatus;
  detail: string;
}

export interface ContentEvent {
  type: 'content';
  content: string;
}

export interface CompleteEvent {
  type: 'complete';
}

export type SSEEvent = StatusEvent | ContentEvent | CompleteEvent;
