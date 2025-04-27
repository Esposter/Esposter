import type { z } from "zod";

import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { UUIDV4_SEARCH_REGEX } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const getRoomCreatorProcedure = <T>(schema: z.ZodType<T>, roomIdKey: keyof T & string) =>
  authedProcedure.use(async ({ ctx, getRawInput, next }) => {
    const rawInput = await getRawInput();
    const result = schema.safeParse(rawInput);
    if (!result.success) throw new TRPCError({ code: "BAD_REQUEST" });

    const value = result.data[roomIdKey];
    if (typeof value !== "string") throw new TRPCError({ code: "BAD_REQUEST" });

    const roomId = value.match(UUIDV4_SEARCH_REGEX)?.[0];
    if (!roomId) throw new TRPCError({ code: "BAD_REQUEST" });

    const isCreator = await ctx.db.query.rooms.findFirst({
      where: (rooms, { and, eq }) => and(eq(rooms.id, roomId), eq(rooms.userId, ctx.session.user.id)),
    });
    if (!isCreator) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next();
  });
