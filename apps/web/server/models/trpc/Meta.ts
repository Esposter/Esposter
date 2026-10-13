import type { McpScope } from "#shared/models/auth/McpScope";

// What a procedure declares about itself beyond its input and output
export interface Meta {
  // Opts the procedure into the MCP endpoint as a tool. The description is what an agent chooses the tool by, and the
  // Scope which keys reach it: a key lists and calls only the tools of the scopes it holds
  mcp?: { description: string; scope: McpScope };
  // Why the procedure is never served to a key, however its scopes read. Only what nothing can undo stays with the
  // Owner's own hand, so a procedure declaring this is one the owner alone performs
  humanOnly?: string;
}
