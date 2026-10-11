import type { Context } from "#server/trpc/context";
import type { McpScope } from "#shared/models/auth/McpScope";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { AnyRouter } from "@trpc/server";

import { getMcpTools } from "#server/services/mcp/getMcpTools";
import { getResultAsync, SITE_NAME } from "@esposter/shared";
import packageJson from "@esposter/web/package.json" with { type: "json" };
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from "@modelcontextprotocol/sdk/types.js";
import { callTRPCProcedure } from "@trpc/server";

// A server whose tools are the router's opted-in procedures of the scopes the caller's key holds, each called through
// The tRPC call path with the caller's context, so its middleware, parsing, guards and rate limit run exactly as they
// Do for the browser. A tool outside those scopes is neither listed nor callable: this is the one place a key's scopes
// Are checked, and every call an agent makes passes through it
export const createMcpServer = (router: AnyRouter, ctx: Context, mcpScopes: McpScope[]) => {
  const mcpTools = getMcpTools(router).filter(({ scope }) => mcpScopes.includes(scope));
  // The low-level server rather than `McpServer`, which parses a tool's arguments with its schema and hands the
  // Handler the parsed output: tRPC would then parse that output a second time, which only holds while every input's
  // Transforms are idempotent. A generic bridge is the advanced use the SDK keeps this server for
  // oxlint-disable-next-line typescript/no-deprecated -- the advanced use above, which the SDK keeps this server for
  const server = new Server({ name: SITE_NAME, version: packageJson.version }, { capabilities: { tools: {} } });

  server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: mcpTools.map(({ annotations, description, inputSchema, name }) => ({
      annotations,
      description,
      inputSchema,
      name,
    })),
  }));
  server.setRequestHandler(CallToolRequestSchema, ({ params: { arguments: toolArguments, name } }) => {
    const mcpTool = mcpTools.find((tool) => tool.name === name);
    if (!mcpTool) throw new McpError(ErrorCode.InvalidParams, `Unknown tool: ${name}`);
    // A rejection is the tool's result rather than a protocol error, so the agent reads why its call failed
    return getResultAsync(() =>
      callTRPCProcedure({
        batchIndex: 0,
        ctx,
        getRawInput: () => Promise.resolve(toolArguments),
        path: mcpTool.path,
        router,
        signal: undefined,
        type: mcpTool.type,
      }),
    ).match(
      (data: unknown): CallToolResult => ({ content: [{ text: JSON.stringify(data ?? null), type: "text" }] }),
      ({ message }): CallToolResult => ({ content: [{ text: message, type: "text" }], isError: true }),
    );
  });
  return server;
};
