import type { Meta } from "@@/server/models/trpc/Meta";
import type { AnyProcedure, AnyRouter } from "@trpc/server";

import { getMcpTools } from "@@/server/services/mcp/getMcpTools";
import { trpcRouter } from "@@/server/trpc/routers";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(getMcpTools, () => {
  // A tool's input schema must be one object, and a subscription has no tool call to answer, so a procedure opting in
  // Any other way would list a tool no client can call
  test("every procedure that opts in is a query or mutation with exactly one object input", () => {
    expect.hasAssertions();

    // Read as any router, whose record is flat as it is at runtime, where the type nests the sub-routers
    const router: AnyRouter = trpcRouter;
    const invalidPaths = Object.entries<AnyProcedure>(router._def.procedures)
      .filter(([, { _def }]) => {
        const { mcp } = (_def.meta ?? {}) as Meta;
        return (
          mcp && (_def.type === "subscription" || _def.inputs.length !== 1 || !(_def.inputs[0] instanceof z.ZodObject))
        );
      })
      .map(([path]) => path);

    expect(invalidPaths).toStrictEqual([]);
  });

  // Turning the dots to underscores would merge `a_b.c` with `a.b_c`, and a client lists the one name twice
  test("names every tool apart", () => {
    expect.hasAssertions();

    const names = getMcpTools(trpcRouter).map(({ name }) => name);

    expect(names).toStrictEqual([...new Set(names)]);
  });
});
