import type { Context } from "#server/trpc/context";

import { createMockAuthSession, createMockContext } from "#server/trpc/context.test";
import { createCallerFactory, publicProcedure, router } from "#server/trpc/index";
import { expectLiveTopicCoverage } from "#server/trpc/routers/liveTopicCoverage.test";
import { usersInAuth } from "@esposter/db-schema";
import { eq } from "drizzle-orm";
import { describe, expect, test } from "vitest";
import { z } from "zod";

// The harness is the check every router's coverage test runs, so it is shown failing for the case it exists to catch: a
// Write that changes a row a read names without returning the row's scope values, so it publishes its table alone
type UserRow = typeof usersInAuth.$inferSelect;

describe(expectLiveTopicCoverage, () => {
  const probeRouter = router({
    readUser: publicProcedure
      .input(z.string())
      .query<undefined | UserRow>(({ ctx, input }) =>
        ctx.db.query.usersInAuth.findFirst({ where: { id: { eq: input } } }),
      ),
    renameUserWithoutReturning: publicProcedure
      .input(z.object({ id: z.string(), name: z.string() }))
      .mutation<void>(async ({ ctx, input }) => {
        await ctx.db.update(usersInAuth).set({ name: input.name }).where(eq(usersInAuth.id, input.id));
      }),
  });

  test("fails a write that publishes no topic a read it changes watches", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const { user } = await createMockAuthSession(context.db);
    const caller = (callContext: Context) => createCallerFactory(probeRouter)(callContext);

    await expect(
      expectLiveTopicCoverage(
        probeRouter,
        {
          queries: [{ call: (callContext) => caller(callContext).readUser(user.id), path: "readUser" }],
          writes: [
            {
              call: (callContext) => caller(callContext).renameUserWithoutReturning({ id: user.id, name: "renamed" }),
              path: "renameUserWithoutReturning",
            },
          ],
        },
        context,
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AssertionError: expected 'renameUserWithoutReturning -> readUser' to be '' // Object.is equality]`,
    );
  });
});
