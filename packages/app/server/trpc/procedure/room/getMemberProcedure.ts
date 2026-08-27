import type { inferParser } from "@trpc/server/unstable-core-do-not-import";
import type { z } from "zod";

import { requireUuid } from "@@/server/trpc/guards/requireUuid";
import { isMember } from "@@/server/trpc/middleware/userToRoom/isMember";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType } from "@esposter/db-schema";

export const getMemberProcedure = <T extends z.ZodType>(schema: T, roomIdKey: keyof inferParser<T>["out"]) =>
  standardAuthedProcedure.input(schema).use(async ({ ctx, input, next }) => {
    // Skip the membership check when roomIdKey is absent from the input or undefined.
    if (!(roomIdKey in (input as object))) return next();

    const value = input[roomIdKey];
    if (value === undefined) return next();

    await isMember(ctx.db, ctx.getSessionPayload, requireUuid(value, DatabaseEntityType.Room));
    return next();
  });
