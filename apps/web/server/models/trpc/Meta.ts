import type { McpScope } from "@esposter/db-schema";

// What a procedure declares about itself beyond its input and output
export interface Meta {
  // Why the procedure is never served to a key, however its scopes read.
  // Only what nothing can undo stays with the owner's own hand.
  // So a procedure declaring this is one the owner alone performs.
  humanOnly?: string;
  // Opts the procedure into the MCP endpoint as a tool.
  // The description is what an agent chooses the tool by, and the scope decides which keys reach it.
  // A key lists and calls only the tools of the scopes it holds.
  mcp?: { description: string; scope: McpScope };
  // Why the procedure is watched by no live topic.
  // Its state is pushed as typed events by a realtime object, or it reads or changes nothing another reader shows.
  staticReason?: string;
}
