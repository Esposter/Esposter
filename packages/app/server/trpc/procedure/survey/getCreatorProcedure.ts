import type { inferParser } from "@trpc/server/unstable-core-do-not-import";
import type { z } from "zod";

import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { TRPCError } from "@trpc/server";

export const getCreatorProcedure = <T extends z.ZodType>(schema: T, surveyIdKey: keyof inferParser<T>["out"]) =>
  standardAuthedProcedure.input(schema).use(async ({ ctx, input, next }) => {
    const surveyId = input[surveyIdKey];
    if (typeof surveyId !== "string") throw new TRPCError({ code: "BAD_REQUEST" });

    const survey = await ctx.db.query.surveys.findFirst({
      where: {
        id: {
          eq: surveyId,
        },
        userId: {
          eq: ctx.session.user.id,
        },
      },
    });
    if (!survey) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next({ ctx: { survey } });
  });
