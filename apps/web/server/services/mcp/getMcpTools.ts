import type { McpTool } from "#server/models/mcp/McpTool";
import type { Meta } from "#server/models/trpc/Meta";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { AnyProcedure, AnyRouter } from "@trpc/server";
import type { z } from "zod";

import { getAgentJsonSchema } from "#server/services/mcp/getAgentJsonSchema";

// Every query and mutation whose meta opts into MCP, as a tool named by its path. The record is flat at runtime, one
// Procedure per dotted path, where its type nests the sub-routers; a tool name takes no dot in every client, so the
// Dots become underscores, which no router key carries
export const getMcpTools = (router: AnyRouter): McpTool[] =>
  Object.entries<AnyProcedure>(router._def.procedures).flatMap(([path, { _def }]) => {
    // A built procedure types its meta as unknown; the root declares it as `Meta`
    const { humanOnly, mcp } = (_def.meta ?? {}) as Meta;
    if (!mcp || humanOnly || _def.type === "subscription") return [];
    // One object input, defaulted or not, which `getMcpTools.test.ts` holds for every procedure that opts in, since a
    // Tool's input schema must be an object
    const [input] = _def.inputs;
    return [
      {
        // A tool is treated as possibly destructive unless it says otherwise, so a query says it changes nothing and a
        // Client can let every read through while it keeps asking about writes
        annotations: { readOnlyHint: _def.type === "query" },
        description: mcp.description,
        inputSchema: getAgentJsonSchema(input as z.ZodType) as Tool["inputSchema"],
        name: path.replaceAll(".", "_"),
        path,
        scope: mcp.scope,
        type: _def.type,
      },
    ];
  });
