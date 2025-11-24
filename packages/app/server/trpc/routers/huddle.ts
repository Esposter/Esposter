import { on } from "@@/server/services/events/on";
import { huddleEventEmitter } from "@@/server/services/huddle/events/huddleEventEmitter";
import { router } from "@@/server/trpc";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { selectRoomSchema, usersToHuddles } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const readHuddleUsersInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type ReadHuddleUsersInput = z.infer<typeof readHuddleUsersInputSchema>;

const onJoinHuddleInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnJoinHuddleInput = z.infer<typeof onJoinHuddleInputSchema>;

const onLeaveHuddleInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnLeaveHuddleInput = z.infer<typeof onLeaveHuddleInputSchema>;

const joinHuddleInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type JoinHuddleInput = z.infer<typeof joinHuddleInputSchema>;

const leaveHuddleInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type LeaveHuddleInput = z.infer<typeof leaveHuddleInputSchema>;

export const huddleRouter = router({
  joinHuddle: getMemberProcedure(joinHuddleInputSchema, "roomId").mutation(async ({ ctx, input: { roomId } }) => {
    await ctx.db.insert(usersToHuddles).values({ roomId, userId: ctx.session.user.id }).onConflictDoNothing();
    const user = await ctx.db.query.users.findFirst({ where: (users, { eq }) => eq(users.id, ctx.session.user.id) });
    if (user) huddleEventEmitter.emit("joinHuddle", { roomId, user });
  }),
  leaveHuddle: getMemberProcedure(leaveHuddleInputSchema, "roomId").mutation(async ({ ctx, input: { roomId } }) => {
    await ctx.db
      .delete(usersToHuddles)
      .where(and(eq(usersToHuddles.roomId, roomId), eq(usersToHuddles.userId, ctx.session.user.id)));
    huddleEventEmitter.emit("leaveHuddle", { roomId, userId: ctx.session.user.id });
  }),
  onJoinHuddle: getMemberProcedure(onJoinHuddleInputSchema, "roomId").subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    for await (const [{ roomId, user }] of on(huddleEventEmitter, "joinHuddle", { signal }))
      if (roomId === input.roomId && user.id !== ctx.session.user.id) yield user;
  }),
  onLeaveHuddle: getMemberProcedure(onLeaveHuddleInputSchema, "roomId").subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    for await (const [{ roomId, userId }] of on(huddleEventEmitter, "leaveHuddle", { signal }))
      if (roomId === input.roomId && userId !== ctx.session.user.id) yield { roomId, userId };
  }),
  readHuddleUsers: getMemberProcedure(readHuddleUsersInputSchema, "roomId").query(({ ctx, input: { roomId } }) =>
    ctx.db.query.usersToHuddles.findMany({
      where: (usersToHuddles, { and, eq, ne }) =>
        and(eq(usersToHuddles.roomId, roomId), ne(usersToHuddles.userId, ctx.session.user.id)),
      with: { user: true },
    }),
  ),
});
