import { createMockAuthSession, createMockContext } from "#server/trpc/context.test";
import { createCallerFactory, publicProcedure, router } from "#server/trpc/index";
import { takeWakeFailures } from "#server/trpc/liveTopicWakeCheck.test";
import { usersInAuth } from "@esposter/db-schema";
import { eq } from "drizzle-orm";
import { describe, expect, test } from "vitest";
import { z } from "zod";

// A write that changes a row a read answers is woken by the topics the handle names for it: the rows it changes, before and after,
// Whether or not it returns them. The check's failure path is shown beside the realtime objects' check (wakeCheckSelf.test.ts), so this
// File shows the write it must not report
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
});

describe("live topic wake check", () => {
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
