import type { Meta } from "#server/models/trpc/Meta";
import type { AnyProcedure, AnyRouter } from "@trpc/server";

import { getMcpTools } from "#server/services/mcp/getMcpTools";
import { publicProcedure, router } from "#server/trpc";
import { trpcRouter } from "#server/trpc/routers";
import { McpScope, McpScopes } from "#shared/models/auth/McpScope";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(getMcpTools, () => {
  // A tool's input schema must be one object, and a subscription has no tool call to answer, so a procedure opting in
  // Any other way would list a tool no client can call. A defaulted object converts to the object, its default beside it
  test("every procedure that opts in is a query or mutation with exactly one object input", () => {
    expect.hasAssertions();

    // Read as any router, whose record is flat as it is at runtime, where the type nests the sub-routers
    const anyRouter: AnyRouter = trpcRouter;
    const invalidPaths = Object.entries<AnyProcedure>(anyRouter._def.procedures)
      .filter(([, { _def }]) => {
        const { mcp } = (_def.meta ?? {}) as Meta;
        const [input] = _def.inputs;
        const objectInput = input instanceof z.ZodPrefault ? input.unwrap() : input;
        return (
          mcp && (_def.type === "subscription" || _def.inputs.length !== 1 || !(objectInput instanceof z.ZodObject))
        );
      })
      .map(([path]) => path);

    expect(invalidPaths).toStrictEqual([]);
  });

  // What a key holding each scope reaches, which is its owner's to decide: a procedure opting in, or moving to another
  // Scope, fails here until the reach it gives a key is written down
  test("gives each scope its own tools", () => {
    expect.hasAssertions();

    const mcpTools = getMcpTools(trpcRouter);

    expect(
      Object.fromEntries(
        McpScopes.map((mcpScope) => [
          mcpScope,
          mcpTools.filter(({ scope }) => scope === mcpScope).map(({ name }) => name),
        ]),
      ),
    ).toMatchInlineSnapshot(`
      {
        "FollowUps": [
          "todoList_addFollowUp",
          "todoList_completeFollowUp",
          "todoList_handBackFollowUp",
          "todoList_readFollowUps",
        ],
        "Resources": [
          "resource_readResourceContent",
          "resource_readResourceContentSchema",
          "resource_readResources",
          "resource_updateResourceContent",
        ],
      }
    `);
  });

  // A procedure the owner alone performs is never a tool, even one that also declares its scope
  test("never lists a human-only procedure", () => {
    expect.hasAssertions();

    const humanOnlyRouter = router({
      purge: publicProcedure
        .meta({ humanOnly: "Nothing restores it", mcp: { description: "Purge", scope: McpScope.Resources } })
        .mutation<void>(() => undefined),
    });

    expect(getMcpTools(humanOnlyRouter)).toStrictEqual([]);
  });

  // Turning the dots to underscores would merge `a_b.c` with `a.b_c`, and a client lists the one name twice
  test("names every tool apart", () => {
    expect.hasAssertions();

    const names = getMcpTools(trpcRouter).map(({ name }) => name);

    expect(names).toStrictEqual([...new Set(names)]);
  });
});
