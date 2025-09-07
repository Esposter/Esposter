import type { inferParser } from "@trpc/server/unstable-core-do-not-import";
import type { z } from "zod";

import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { uuidValidateV4 } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const getCreatorProcedure = <T extends z.ZodType>(schema: T, roomIdKey: keyof inferParser<T>["out"]) =>
  authedProcedure.input(schema).use(async ({ ctx, input, next }) => {
    const value = input[roomIdKey];
    if (!(typeof value === "string" && uuidValidateV4(value))) throw new TRPCError({ code: "BAD_REQUEST" });

    const isCreator = await ctx.db.query.rooms.findFirst({
      where: (rooms, { and, eq }) => and(eq(rooms.id, value), eq(rooms.userId, ctx.session.user.id)),
    });
    if (!isCreator) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next();
  });
