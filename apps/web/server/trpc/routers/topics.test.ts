import type { Meta } from "#server/models/trpc/Meta";
import type { AnyProcedure, AnyRouter } from "@trpc/server";

import { trpcRouter } from "#server/trpc/routers/index";
import { describe, expect, test } from "vitest";

describe("topics", () => {
  // A procedure that declares its topics by hand and also why it has none says two things about the same call. One with
  // Neither is inferred from the statements it awaits, so it needs no declaration
  test("no procedure declares both its topics by hand and why it has none", () => {
    expect.hasAssertions();

    // Read as any router, whose record is flat as it is at runtime, where the type nests the sub-routers
    const anyRouter: AnyRouter = trpcRouter;
    const doubleDeclaredPaths = Object.entries<AnyProcedure>(anyRouter._def.procedures)
      .filter(([, { _def }]) => {
        const { staticReason, topics } = (_def.meta ?? {}) as Meta;
        return staticReason !== undefined && topics !== undefined;
      })
      .map(([path]) => path);

    expect(doubleDeclaredPaths).toStrictEqual([]);
  });
});
