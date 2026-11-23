import { createMockAuthSession, createMockContext, createMockUser } from "#server/trpc/context.test";
import { createCallerFactory, publicProcedure, router } from "#server/trpc/index";
import { takeWakeFailures } from "#server/trpc/liveTopicWakeCheck.test";
import { usersInAuth } from "@esposter/db-schema";
import { eq } from "drizzle-orm";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("live topic wake check", () => {
  // The probe the wake check is shown on: a read of a user, and a rename of one that returns the row it changed, so the
  // Recorder names the row by its topic and the read it answers is woken
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

  test("fails a write whose publish does not wake a read it changes, naming both", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const { user } = await createMockAuthSession(context.db);
    const other = await createMockUser(context.db);
    // The database the context holds before the middleware records it: a write through it publishes nothing
    const unrecordedDb = context.db;
    const missedRouter = router({
      readUser: probeRouter.readUser,
      // The write to the other user is recorded and publishes that user's row, which the read does not watch. The write
      // To The read's own user goes through the unrecorded database, so nothing publishes it and the read changes
      // Unwoken
      renameBothUsers: publicProcedure
        .input(z.object({ id: z.string(), name: z.string(), otherId: z.string() }))
        .mutation<void>(async ({ ctx, input }) => {
          await ctx.db.update(usersInAuth).set({ name: input.name }).where(eq(usersInAuth.id, input.otherId));
          await unrecordedDb.update(usersInAuth).set({ name: input.name }).where(eq(usersInAuth.id, input.id));
        }),
    });
    const caller = createCallerFactory(missedRouter)(context);
    await caller.readUser(user.id);
    const input = { id: user.id, name: "renamed", otherId: other.id };
    await caller.renameBothUsers(input);

    const failures = takeWakeFailures();
    expect(failures).toHaveLength(1);
    expect(failures[0]?.split(", which")[0]).toBe(
      `readUser(${JSON.stringify(user.id)}) changed by renameBothUsers(${JSON.stringify(input)})`,
    );
    expect(failures[0]).toContain(`auth_users:id=${other.id}`);
  });

  test("fails a write that publishes nothing and changes a read it watches, naming both", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const { user } = await createMockAuthSession(context.db);
    // The database the context holds before the middleware records it: a write through it publishes nothing
    const unrecordedDb = context.db;
    const missedRouter = router({
      readUser: probeRouter.readUser,
      renameUserOutsideRecorder: publicProcedure
        .input(z.object({ id: z.string(), name: z.string() }))
        .mutation<void>(async ({ input }) => {
          await unrecordedDb.update(usersInAuth).set({ name: input.name }).where(eq(usersInAuth.id, input.id));
        }),
    });
    const caller = createCallerFactory(missedRouter)(context);
    await caller.readUser(user.id);
    await caller.renameUserOutsideRecorder({ id: user.id, name: "renamed" });

    expect(takeWakeFailures().map((failure) => failure.split(" changed by ")[0])).toStrictEqual([
      `readUser(${JSON.stringify(user.id)})`,
    ]);
  });
});
