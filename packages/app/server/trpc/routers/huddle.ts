import { on } from "@@/server/services/events/on";
import { huddleEventEmitter } from "@@/server/services/huddle/events/huddleEventEmitter";
import { router } from "@@/server/trpc";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { DatabaseEntityType, selectRoomSchema, usersToHuddles, UserToHuddleRelations } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
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
  joinHuddle: getMemberProcedure(joinHuddleInputSchema, "roomId").mutation(({ ctx, input: { roomId } }) => {
    ctx.db.transaction(async (tx) => {
      const userToHuddle = (
        await tx.insert(usersToHuddles).values({ roomId, userId: ctx.session.user.id }).returning()
      ).find(Boolean);
      if (!userToHuddle)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.UserToHuddle, roomId).message,
        });

      const userToHuddleWithRelations = await tx.query.usersToHuddles.findFirst({
        where: (usersToHuddles, { and, eq }) =>
          and(eq(usersToHuddles.userId, userToHuddle.userId), eq(usersToHuddles.roomId, userToHuddle.roomId)),
        with: UserToHuddleRelations,
      });
      if (!userToHuddleWithRelations)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.UserToHuddle, JSON.stringify(userToHuddle)).message,
        });

      const { user } = userToHuddleWithRelations;
      huddleEventEmitter.emit("joinHuddle", { roomId, user });
      return userToHuddleWithRelations;
    });
  }),
  leaveHuddle: getMemberProcedure(leaveHuddleInputSchema, "roomId").mutation(async ({ ctx, input: { roomId } }) => {
    const deletedUserToHuddle = (
      await ctx.db
        .delete(usersToHuddles)
        .where(and(eq(usersToHuddles.roomId, roomId), eq(usersToHuddles.userId, ctx.session.user.id)))
        .returning()
    ).find(Boolean);
    if (!deletedUserToHuddle)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Delete, DatabaseEntityType.UserToHuddle, roomId).message,
      });

    huddleEventEmitter.emit("leaveHuddle", { roomId, userId: ctx.session.user.id });
    return deletedUserToHuddle;
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
