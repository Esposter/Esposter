import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { ProcedureType } from "@trpc/server";

// A procedure that opted into the MCP endpoint, as the tool an agent lists, with the path and type it is called by
export interface McpTool extends Pick<Tool, "description" | "inputSchema" | "name"> {
  path: string;
  type: Exclude<ProcedureType, "subscription">;
}
