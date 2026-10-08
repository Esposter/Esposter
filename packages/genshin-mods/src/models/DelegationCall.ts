// The part of a tool call the lookup count reads: the tool, a shell command with its background flag, and the agent
// A subagent's call names
export interface DelegationCall {
  agentId?: string;
  command?: string;
  run_in_background?: boolean;
  tool: string;
}
