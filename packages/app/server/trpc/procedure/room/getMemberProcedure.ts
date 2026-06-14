import type { inferParser } from "@trpc/server/unstable-core-do-not-import";
import type { z } from "zod";

import { isMember } from "@@/server/trpc/middleware/userToRoom/isMember";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { uuidValidateV4 } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const getMemberProcedure = <T extends z.ZodType>(schema: T, roomIdKey: keyof inferParser<T>["out"]) =>
  standardAuthedProcedure.input(schema).use(async ({ ctx, input, next }) => {
    // Skip the membership check when roomIdKey is absent from the input or undefined.
    if (!(roomIdKey in (input as object))) return next();

    const value = input[roomIdKey];
    if (value === undefined) return next();
    else if (!(typeof value === "string" && uuidValidateV4(value))) throw new TRPCError({ code: "BAD_REQUEST" });

    await isMember(ctx.db, ctx.getSessionPayload, value);
    return next();
  });
