import { prisma } from "@/prisma";
import { publicProcedure } from "@/server/trpc";
import { isAuthed } from "@/server/trpc/middleware/auth";
import { isRateLimited } from "@/server/trpc/middleware/rateLimiter";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const rateLimitedProcedure = publicProcedure.use(isRateLimited);
export const authedProcedure = rateLimitedProcedure.use(isAuthed);

export const getRoomUserProcedure = <T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  roomIdKey: keyof T["shape"] & string
) =>
  authedProcedure.use(async ({ ctx, rawInput, next }) => {
    const result = schema.safeParse(rawInput);
    if (!result.success) throw new TRPCError({ code: "BAD_REQUEST" });
    const roomId = result.data[roomIdKey];
    if (typeof roomId !== "string") throw new TRPCError({ code: "BAD_REQUEST" });
    // @NOTE: We should be able to use "exists" function in the future
    // https://github.com/prisma/prisma/issues/5022
    const roomOnUser = await prisma.roomsOnUsers.findUnique({
      where: { userId_roomId: { userId: ctx.session.user.id, roomId } },
    });
    if (!roomOnUser) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next();
  });
