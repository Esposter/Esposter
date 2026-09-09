import type { inferParser } from "@trpc/server/unstable-core-do-not-import";
import type { z } from "zod";

import { requireUuid } from "@@/server/trpc/guards/requireUuid";
import { assertIsMember } from "@@/server/trpc/middleware/userToRoom/assertIsMember";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType } from "@esposter/db-schema";

export const getMemberProcedure = <T extends z.ZodType>(schema: T, roomIdKey: keyof inferParser<T>["out"]) =>
  standardAuthedProcedure.input(schema).use(async ({ ctx, input, next }) => {
    // The key is optional on the reads that answer across rooms — `readRooms` filters by one or by none — and a
    // Room-less call has no membership to check
    const value = input[roomIdKey];
    if (value !== undefined)
      await assertIsMember(ctx.db, ctx.getSessionPayload, requireUuid(value, DatabaseEntityType.Room));
    return next();
  });
