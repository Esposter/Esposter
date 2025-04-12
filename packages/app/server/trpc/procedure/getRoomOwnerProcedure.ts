import type { Type } from "arktype";

import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { UUIDV4_SEARCH_REGEX } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const getRoomOwnerProcedure = <T extends Type<object>>(schema: T, roomIdKey: keyof T["inferIn"] & string) =>
  authedProcedure.use(async ({ ctx, getRawInput, next }) => {
    const rawInput = await getRawInput();
    if (!schema.allows(rawInput)) throw new TRPCError({ code: "BAD_REQUEST" });

    const value = rawInput[roomIdKey];
    if (typeof value !== "string") throw new TRPCError({ code: "BAD_REQUEST" });

    const roomId = value.match(UUIDV4_SEARCH_REGEX)?.[0];
    if (!roomId) throw new TRPCError({ code: "BAD_REQUEST" });

    const isOwner = await ctx.db.query.rooms.findFirst({
      where: (rooms, { and, eq }) => and(eq(rooms.id, roomId), eq(rooms.userId, ctx.session.user.id)),
    });
    if (!isOwner) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next();
  });
