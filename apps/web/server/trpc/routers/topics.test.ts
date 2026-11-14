import type { Meta } from "#server/models/trpc/Meta";
import type { AnyProcedure, AnyRouter } from "@trpc/server";

import { trpcRouter } from "#server/trpc/routers";
import { describe, expect, test } from "vitest";

describe("topics", () => {
  // A procedure with neither would let a read stay static or a write skip its readers without anyone deciding so, and
  // One with both says two things about the same call
  test("every procedure declares its topics or why it has none, never both", () => {
    expect.hasAssertions();

    // Read as any router, whose record is flat as it is at runtime, where the type nests the sub-routers
    const anyRouter: AnyRouter = trpcRouter;
    const undeclaredPaths = Object.entries<AnyProcedure>(anyRouter._def.procedures)
      .filter(([, { _def }]) => {
        const { staticReason, topics } = (_def.meta ?? {}) as Meta;
        return (staticReason === undefined) === (topics === undefined);
      })
      .map(([path]) => path);

    expect(undeclaredPaths).toStrictEqual([]);
  });
});
