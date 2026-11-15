import { z } from "zod";

// What an API key reaches at the MCP endpoint. A procedure that opts in names one, and a key holds the ones its owner
// Ticked when creating it, so a key made for one kind of work reaches nothing else
export const McpScope = { FollowUps: "FollowUps", Resources: "Resources" } as const;
export type McpScope = (typeof McpScope)[keyof typeof McpScope];

export const mcpScopeSchema = z.enum(McpScope) satisfies z.ZodType<McpScope>;

export const McpScopes = Object.values(McpScope);
