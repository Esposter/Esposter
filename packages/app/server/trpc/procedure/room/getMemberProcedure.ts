import type { inferParser } from "@trpc/server/unstable-core-do-not-import";
import type { z } from "zod";

import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { uuidValidateV4 } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const getMemberProcedure = <T extends z.ZodType>(schema: T, roomIdKey: keyof inferParser<T>["out"]) =>
  standardAuthedProcedure.input(schema).use(async ({ ctx, input, next }) => {
    // If the roomIdKey is not in the input, we don't need to check if the user is a member
    if (!(roomIdKey in (input as object))) return next();

    const value = input[roomIdKey];
    if (!(typeof value === "string" && uuidValidateV4(value))) throw new TRPCError({ code: "BAD_REQUEST" });

    const isMember = await ctx.db.query.usersToRooms.findFirst({
      where: (usersToRooms, { and, eq }) =>
        and(eq(usersToRooms.userId, ctx.session.user.id), eq(usersToRooms.roomId, value)),
    });
    if (!isMember) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next();
  });
