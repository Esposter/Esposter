import type { RoomPermission } from "@esposter/shared";
import type { inferParser } from "@trpc/server/unstable-core-do-not-import";
import type { z } from "zod";

import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { hasPermission } from "@@/server/services/room/rbac/hasPermission";
import { AuthedProcedureMap } from "@@/server/trpc/procedure/AuthedProcedureMap";
import { uuidValidateV4 } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const getPermissionProcedure = <T extends z.ZodType>(
  permission: RoomPermission,
  schema: T,
  roomIdKey: keyof inferParser<T>["out"],
  rateLimiterType = RateLimiterType.Standard,
) =>
  AuthedProcedureMap[rateLimiterType].input(schema).use(async ({ ctx, input, next }) => {
    const value = input[roomIdKey];
    if (!(typeof value === "string" && uuidValidateV4(value))) throw new TRPCError({ code: "BAD_REQUEST" });

    const isPermitted = await hasPermission(ctx.db, ctx.getSessionPayload.user.id, value, permission);
    if (!isPermitted) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next();
  });
