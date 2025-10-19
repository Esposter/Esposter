import type { inferParser } from "@trpc/server/unstable-core-do-not-import";
import type { z } from "zod";

import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { getIsCreator } from "@@/server/services/room/getIsCreator";
import { AuthedProcedureMap } from "@@/server/trpc/procedure/AuthedProcedureMap";
import { uuidValidateV4 } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const getCreatorProcedure = <T extends z.ZodType>(
  schema: T,
  roomIdKey: keyof inferParser<T>["out"],
  rateLimiterType = RateLimiterType.Standard,
) =>
  AuthedProcedureMap[rateLimiterType].input(schema).use(async ({ ctx, input, next }) => {
    const value = input[roomIdKey];
    if (!(typeof value === "string" && uuidValidateV4(value))) throw new TRPCError({ code: "BAD_REQUEST" });

    const isCreator = await getIsCreator(ctx.db, ctx.session, value);
    if (!isCreator) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next();
  });
