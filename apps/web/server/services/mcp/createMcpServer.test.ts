import type { Context } from "#server/trpc/context";

import { createMcpServer } from "#server/services/mcp/createMcpServer";
import { publicProcedure, router } from "#server/trpc";
import { createMockContext } from "#server/trpc/context.test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { beforeAll, describe, expect, onTestFinished, test } from "vitest";
import { z } from "zod";

describe(createMcpServer, () => {
  const description = "description";
  const testRouter = router({
    nested: router({
      hidden: publicProcedure.input(z.object({ value: z.string() })).query<string>(({ input: { value } }) => value),
      read: publicProcedure
        .meta({ mcp: { description } })
        .input(z.object({ value: z.string().max(1) }))
        .query<string>(({ input: { value } }) => value),
    }),
  });

  let mockContext: Context;

  beforeAll(async () => {
    mockContext = await createMockContext();
  });

  const createConnectedClient = async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "", version: "" });
    await createMcpServer(testRouter, mockContext).connect(serverTransport);
    await client.connect(clientTransport);
    onTestFinished(() => client.close());
    return client;
  };

  test("lists only the procedures that opt in, named by their path", async () => {
    expect.hasAssertions();

    const client = await createConnectedClient();

    const { tools } = await client.listTools();

    expect(tools).toStrictEqual([
      {
        description,
        inputSchema: {
          $schema: "https://json-schema.org/draft/2020-12/schema",
          properties: { value: { maxLength: 1, type: "string" } },
          required: ["value"],
          type: "object",
        },
        name: "nested_read",
      },
    ]);
  });

  test("calls the procedure and answers with its result", async () => {
    expect.hasAssertions();

    const client = await createConnectedClient();

    const result = await client.callTool({ arguments: { value: "" }, name: "nested_read" });

    expect(result).toStrictEqual({ content: [{ text: '""', type: "text" }] });
  });

  test("answers a rejected call as a failed result", async () => {
    expect.hasAssertions();

    const client = await createConnectedClient();

    const result = await client.callTool({ arguments: { value: "  " }, name: "nested_read" });

    expect(result).toMatchInlineSnapshot(`
      {
        "content": [
          {
            "text": "[
        {
          "origin": "string",
          "code": "too_big",
          "maximum": 1,
          "inclusive": true,
          "path": [
            "value"
          ],
          "message": "Too big: expected string to have <=1 characters"
        }
      ]",
            "type": "text",
          },
        ],
        "isError": true,
      }
    `);
  });

  test("refuses a procedure that did not opt in", async () => {
    expect.hasAssertions();

    const client = await createConnectedClient();

    await expect(
      client.callTool({ arguments: { value: "" }, name: "nested_hidden" }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[McpError: MCP error -32602: MCP error -32602: Unknown tool: nested_hidden]`,
    );
  });
});
