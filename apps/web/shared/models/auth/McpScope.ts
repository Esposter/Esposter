import { z } from "zod";

// What an API key reaches at the MCP endpoint. A procedure that opts in names one, and a key holds the ones its owner
// Ticked when creating it, so a key made for one kind of work reaches nothing else
export enum McpScope {
  FollowUps = "FollowUps",
  Resources = "Resources",
}

export const mcpScopeSchema = z.enum(McpScope) satisfies z.ZodType<McpScope>;

export const McpScopes = Object.values(McpScope);
