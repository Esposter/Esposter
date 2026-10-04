import type { McpTool } from "#server/models/mcp/McpTool";
import type { Meta } from "#server/models/trpc/Meta";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { AnyProcedure, AnyRouter } from "@trpc/server";

import { z } from "zod";

// Every query and mutation whose meta opts into MCP, as a tool named by its path. The record is flat at runtime, one
// Procedure per dotted path, where its type nests the sub-routers; a tool name takes no dot in every client, so the
// Dots become underscores, which no router key carries
export const getMcpTools = (router: AnyRouter): McpTool[] =>
  Object.entries<AnyProcedure>(router._def.procedures).flatMap(([path, { _def }]) => {
    // A built procedure types its meta as unknown; the root declares it as `Meta`
    const { mcp } = (_def.meta ?? {}) as Meta;
    if (!mcp || _def.type === "subscription") return [];
    // One object input, which `getMcpTools.test.ts` holds for every procedure that opts in, since a tool's input
    // Schema must be an object
    const [input] = _def.inputs;
    return [
      {
        description: mcp.description,
        inputSchema: z.toJSONSchema(input as z.ZodObject, { io: "input" }) as Tool["inputSchema"],
        name: path.replaceAll(".", "_"),
        path,
        type: _def.type,
      },
    ];
  });
