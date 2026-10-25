import type { Context } from "#server/trpc/context";
import type { McpScope } from "#shared/models/auth/McpScope";

import { createMcpServer } from "#server/services/mcp/createMcpServer";
import { trpcRouter } from "#server/trpc/routers";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { describe, onTestFinished } from "vitest";

// A key holding these scopes, connected to the MCP server an agent reaches. Each tool it calls is answered as the agent
// reads it: the data as parsed JSON, and a refused call as a rejection carrying the words it is refused in
export const connectAgentKey = async (ctx: Context, mcpScopes: McpScope[]) => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "", version: "" });
  await createMcpServer(trpcRouter, ctx, mcpScopes).connect(serverTransport);
  await client.connect(clientTransport);
  onTestFinished(() => client.close());

  return async <T>(name: string, toolArguments: Record<string, unknown>): Promise<T> => {
    const { content, isError } = CallToolResultSchema.parse(await client.callTool({ arguments: toolArguments, name }));
    const [answer] = content;
    if (answer?.type !== "text") throw new Error(`${name} answered without text`);
    if (isError) throw new Error(answer.text);
    return JSON.parse(answer.text);
  };
};

describe.todo("connectAgentKey");
