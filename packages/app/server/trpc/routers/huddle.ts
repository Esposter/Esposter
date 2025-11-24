import { on } from "@@/server/services/events/on";
import { huddleEventEmitter } from "@@/server/services/huddle/events/huddleEventEmitter";
import { router } from "@@/server/trpc";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { selectRoomSchema, usersToHuddles } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const readHuddleParticipantsInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type ReadHuddleParticipantsInput = z.infer<typeof readHuddleParticipantsInputSchema>;

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
    huddleEventEmitter.emit("join", { roomId, userId: ctx.session.user.id });
  }),
  leaveHuddle: getMemberProcedure(leaveHuddleInputSchema, "roomId").mutation(async ({ ctx, input: { roomId } }) => {
    await ctx.db
      .delete(usersToHuddles)
      .where(and(eq(usersToHuddles.roomId, roomId), eq(usersToHuddles.userId, ctx.session.user.id)));
    huddleEventEmitter.emit("leave", { roomId, userId: ctx.session.user.id });
  }),
  onJoinHuddle: getMemberProcedure(onJoinHuddleInputSchema, "roomId").subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    for await (const [event] of on(huddleEventEmitter, "join", { signal }))
      if (event.roomId === input.roomId && event.userId !== ctx.session.user.id) yield event;
  }),
  onLeaveHuddle: getMemberProcedure(onLeaveHuddleInputSchema, "roomId").subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    for await (const [{ roomId, userId }] of on(huddleEventEmitter, "leave", { signal }))
      if (roomId === input.roomId && userId !== ctx.session.user.id) yield { roomId, userId };
  }),
  readHuddleParticipants: getMemberProcedure(readHuddleParticipantsInputSchema, "roomId").query(
    ({ ctx, input: { roomId } }) =>
      ctx.db.query.usersToHuddles.findMany({
        where: (usersToHuddles, { and, eq, ne }) =>
          and(eq(usersToHuddles.roomId, roomId), ne(usersToHuddles.userId, ctx.session.user.id)),
        with: { user: true },
      }),
  ),
});
