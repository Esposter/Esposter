import type { z } from "zod";

import { db } from "@/db";
import { authedProcedure } from "@/server/trpc/procedure/authedProcedure";
import { UUIDV4_REGEX } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const getRoomUserProcedure = <T extends z.ZodObject<z.ZodRawShape>>(schema: T, key: keyof T["shape"] & string) =>
  authedProcedure.use(async ({ ctx, next, rawInput }) => {
    const result = schema.safeParse(rawInput);
    if (!result.success) throw new TRPCError({ code: "BAD_REQUEST" });

    const value = result.data[key];
    if (typeof value !== "string") throw new TRPCError({ code: "BAD_REQUEST" });

    const roomId = value.match(UUIDV4_REGEX)?.[0];
    if (!roomId) throw new TRPCError({ code: "BAD_REQUEST" });

    const isMember = await db.query.usersToRooms.findFirst({
      where: (usersToRooms, { and, eq }) =>
        and(eq(usersToRooms.userId, ctx.session.user.id), eq(usersToRooms.roomId, roomId)),
    });
    if (!isMember) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next();
  });