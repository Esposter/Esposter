import type { RoomPermission } from "@esposter/db-schema";
import type { inferParser } from "@trpc/server/unstable-core-do-not-import";
import type { z } from "zod";

import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { requireUuid } from "@@/server/trpc/guards/requireUuid";
import { AuthedProcedureMap } from "@@/server/trpc/procedure/AuthedProcedureMap";
import { checkHasPermission } from "@esposter/db";
import { DatabaseEntityType } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";

export const getPermissionsProcedure = <T extends z.ZodType>(
  permission: RoomPermission,
  schema: T,
  roomIdKey: keyof inferParser<T>["out"],
  rateLimiterType = RateLimiterType.Standard,
) =>
  AuthedProcedureMap[rateLimiterType].input(schema).use(async ({ ctx, input, next }) => {
    const roomId = requireUuid(input[roomIdKey], DatabaseEntityType.Room);
    const isPermitted = await checkHasPermission(ctx.db, ctx.getSessionPayload.user.id, roomId, permission);
    if (!isPermitted) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next();
  });
