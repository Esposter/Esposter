import type { inferParser } from "@trpc/server/unstable-core-do-not-import";
import type { z } from "zod";

import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { AuthedProcedureMap } from "@@/server/trpc/procedure/AuthedProcedureMap";
import { uuidValidateV4 } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const getOwnerProcedure = <T extends z.ZodType>(
  schema: T,
  roomIdKey: keyof inferParser<T>["out"],
  rateLimiterType = RateLimiterType.Standard,
) =>
  AuthedProcedureMap[rateLimiterType].input(schema).use(async ({ ctx, input, next }) => {
    const value = input[roomIdKey];
    if (!(typeof value === "string" && uuidValidateV4(value))) throw new TRPCError({ code: "BAD_REQUEST" });

    const room = await ctx.db.query.roomsInMessage.findFirst({
      columns: { id: true },
      where: { id: { eq: value }, userId: { eq: ctx.getSessionPayload.user.id } },
    });
    if (!room) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next();
  });
