import type { Context } from "#server/trpc/context";

import { createMockAuthSession, createMockContext } from "#server/trpc/context.test";
import { createCallerFactory, publicProcedure, router } from "#server/trpc/index";
import { expectLiveTopicCoverage, getTouchedTables } from "#server/trpc/routers/liveTopicCoverage.test";
import { recordStatements } from "@esposter/db";
import { roomsInMessage, RoomType, usersInAuth, usersToRoomsInMessage } from "@esposter/db-schema";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
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

  const cascadeRouter = router({
    deleteRoomWithoutPublishing: publicProcedure.input(z.string()).mutation<void>(async ({ ctx, input }) => {
      await ctx.db.delete(roomsInMessage).where(eq(roomsInMessage.id, input));
    }),
    readMemberships: publicProcedure
      .input(z.string())
      .query<unknown[]>(({ ctx, input }) =>
        ctx.db.select().from(usersToRoomsInMessage).where(eq(usersToRoomsInMessage.roomId, input)),
      ),
  });

  // A delete takes its room's memberships with it through the cascade, so the write touches the memberships table though it
  // Names only the rooms. A filter that reran only the reads of the table the write names would skip the membership read
  test("a write touches the tables its cascade removes rows from, not only the table it names", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const { user } = await createMockAuthSession(context.db);
    const roomId = v7();
    await context.db.insert(roomsInMessage).values({ id: roomId, name: "room", type: RoomType.Room, userId: user.id });
    await context.db.insert(usersToRoomsInMessage).values({ roomId, userId: user.id });
    const { database, statements } = recordStatements(context.db);
    await createCallerFactory(cascadeRouter)({
      ...context,
      db: database,
      responseHeaders: new Headers(),
    }).deleteRoomWithoutPublishing(roomId);

    await expect(getTouchedTables(statements)).resolves.toContain("message_usersToRooms");
  });
});
