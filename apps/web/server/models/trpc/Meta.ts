import type { McpScope } from "@esposter/db-schema";

// What a procedure declares about itself beyond its input and output
export interface Meta {
  // Why the procedure is never served to a key, however its scopes read. Only what nothing can undo stays with the
  // Owner's own hand, so a procedure declaring this is one the owner alone performs
  humanOnly?: string;
  // Opts the procedure into the MCP endpoint as a tool. The description is what an agent chooses the tool by, and the
  // Scope which keys reach it: a key lists and calls only the tools of the scopes it holds
  mcp?: { description: string; scope: McpScope };
  // Why the procedure has no topics: its state is pushed as typed events by a realtime object, or it reads or changes
  // Nothing another reader shows. Exactly one of this and `topics` is declared, which `routers/topics.test.ts` holds
  staticReason?: string;
  // Set by `getTopicsProcedure`, the one writer: the procedure declares the topics a query reads or a mutation changed
  // (the live queries design)
  topics?: true;
}
