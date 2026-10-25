import type { Context } from "#server/trpc/context";

import { createMcpServer } from "#server/services/mcp/createMcpServer";
import { createMockContext } from "#server/trpc/context.test";
import { trpcRouter } from "#server/trpc/routers";
import { McpScope } from "#shared/models/auth/McpScope";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { beforeAll, describe, expect, onTestFinished, test } from "vitest";

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

describe(connectAgentKey, () => {
  let mockContext: Context;

  beforeAll(async () => {
    mockContext = await createMockContext();
  });

  test("throws the words a refused call is refused in", async () => {
    expect.hasAssertions();

    const callAgentTool = await connectAgentKey(mockContext, [McpScope.Resources]);

    await expect(callAgentTool("resource_deleteResources", { ids: "" })).rejects.toThrow('"expected": "array"');
  });
});
