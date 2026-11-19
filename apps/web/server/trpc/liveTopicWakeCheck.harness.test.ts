import { createMockAuthSession, createMockContext } from "#server/trpc/context.test";
import { createCallerFactory, publicProcedure, router } from "#server/trpc/index";
import { takeWakeFailures } from "#server/trpc/liveTopicWakeCheck.test";
import { usersInAuth } from "@esposter/db-schema";
import { eq } from "drizzle-orm";
import { describe, expect, test } from "vitest";
import { z } from "zod";

// The wake check is shown failing for the case it exists to catch: a write that changes a row a read answers, but publishes
// Only the table, which a read scoped to the row does not watch. The same write returning the row publishes the row's topic
const probeRouter = router({
  readUser: publicProcedure
    .input(z.string())
    .query<typeof usersInAuth.$inferSelect | undefined>(({ ctx, input }) =>
      ctx.db.query.usersInAuth.findFirst({ where: { id: { eq: input } } }),
    ),
  renameUser: publicProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation<(typeof usersInAuth.$inferSelect)[]>(({ ctx, input }) =>
      ctx.db.update(usersInAuth).set({ name: input.name }).where(eq(usersInAuth.id, input.id)).returning(),
    ),
  renameUserWithoutReturning: publicProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation<void>(async ({ ctx, input }) => {
      await ctx.db.update(usersInAuth).set({ name: input.name }).where(eq(usersInAuth.id, input.id));
    }),
});

describe("live topic wake check", () => {
  test("fails a write that changes a read it does not wake", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const { user } = await createMockAuthSession(context.db);
    const caller = createCallerFactory(probeRouter)(context);
    await caller.readUser(user.id);
    await caller.renameUserWithoutReturning({ id: user.id, name: "renamed" });

    expect(takeWakeFailures().map((failure) => failure.split(" changed by ")[0])).toStrictEqual([
      `readUser(${JSON.stringify(user.id)})`,
    ]);
  });

  test("passes a write whose topics wake the read it changes", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const { user } = await createMockAuthSession(context.db);
    const caller = createCallerFactory(probeRouter)(context);
    await caller.readUser(user.id);
    await caller.renameUser({ id: user.id, name: "renamed" });

    expect(takeWakeFailures()).toStrictEqual([]);
    await expect(caller.readUser(user.id)).resolves.toMatchObject({ name: "renamed" });
  });
});
