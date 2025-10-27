export interface Document {
  id: number;
  title: string;
  content: string;
  fileName: string | null;
  summary?: string;
}

export interface Agent {
  id: string;
  name: string;
  prompt: string;
  model: string;
  enabled: boolean;
}

export interface AgentResult {
  agentId: string;
  agentName: string;
  result: string;
}

export interface Theme {
  name: string;
  colors: {
    '--primary-bg': string;
    '--secondary-bg': string;
    '--primary-text': string;
    '--secondary-text': string;
    '--accent-color': string;
    '--accent-text': string;
    '--border-color': string;
  };
}