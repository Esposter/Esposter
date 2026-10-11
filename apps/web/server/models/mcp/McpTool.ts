import type { McpScope } from "#shared/models/auth/McpScope";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { ProcedureType } from "@trpc/server";

// A procedure that opted into the MCP endpoint, as the tool an agent lists, with the path and type it is called by and
// The scope a key must hold to reach it
export interface McpTool extends Pick<Tool, "annotations" | "description" | "inputSchema" | "name"> {
  path: string;
  scope: McpScope;
  type: Exclude<ProcedureType, "subscription">;
}
