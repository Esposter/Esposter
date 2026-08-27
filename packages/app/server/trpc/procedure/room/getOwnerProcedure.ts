import type { inferParser } from "@trpc/server/unstable-core-do-not-import";
import type { z } from "zod";

import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { requireUuid } from "@@/server/trpc/guards/requireUuid";
import { AuthedProcedureMap } from "@@/server/trpc/procedure/AuthedProcedureMap";
import { DatabaseEntityType } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";

export const getOwnerProcedure = <T extends z.ZodType>(
  schema: T,
  roomIdKey: keyof inferParser<T>["out"],
  rateLimiterType = RateLimiterType.Standard,
) =>
  AuthedProcedureMap[rateLimiterType].input(schema).use(async ({ ctx, input, next }) => {
    const roomId = requireUuid(input[roomIdKey], DatabaseEntityType.Room);
    const room = await ctx.db.query.roomsInMessage.findFirst({
      columns: { id: true },
      where: { id: { eq: roomId }, userId: { eq: ctx.getSessionPayload.user.id } },
    });
    if (!room) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next();
  });
