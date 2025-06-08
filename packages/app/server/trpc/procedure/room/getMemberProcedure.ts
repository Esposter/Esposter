import type { inferParser } from "@trpc/server/unstable-core-do-not-import";
import type { z } from "zod/v4";

import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { NotFoundError, UUIDV4_SEARCH_REGEX } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const getMemberProcedure = <T extends z.ZodType>(schema: T, roomIdKey: keyof inferParser<T>["out"]) =>
  authedProcedure.input(schema).use(async ({ ctx, input, next }) => {
    const value = input[roomIdKey];
    if (typeof value !== "string") throw new TRPCError({ code: "BAD_REQUEST" });

    const roomId = value.match(UUIDV4_SEARCH_REGEX)?.[0];
    if (!roomId)
      throw new TRPCError({ code: "BAD_REQUEST", message: new NotFoundError(DatabaseEntityType.Room, value).message });

    const isMember = await ctx.db.query.usersToRooms.findFirst({
      where: (usersToRooms, { and, eq }) =>
        and(eq(usersToRooms.userId, ctx.session.user.id), eq(usersToRooms.roomId, roomId)),
    });
    if (!isMember) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next({ ctx: { roomId } });
  });
