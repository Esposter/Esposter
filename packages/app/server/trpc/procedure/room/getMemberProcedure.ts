import type { z } from "zod";

import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { NotFoundError, UUIDV4_SEARCH_REGEX } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const getMemberProcedure = <T extends z.ZodRawShape>(schema: z.ZodObject<T>, roomIdKey: keyof T) =>
  authedProcedure.use(async ({ ctx, getRawInput, next }) => {
    const rawInput = await getRawInput();
    const result = schema.safeParse(rawInput);
    if (!result.success) throw new TRPCError({ code: "BAD_REQUEST" });

    const value = result.data[roomIdKey];
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
