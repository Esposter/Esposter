import type { z } from "zod";

import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { TRPCError } from "@trpc/server";

export const getCreatorProcedure = <T extends z.ZodRawShape>(schema: z.ZodObject<T>, surveyIdKey: keyof T) =>
  authedProcedure.use(async ({ ctx, getRawInput, next }) => {
    const rawInput = await getRawInput();
    const result = schema.safeParse(rawInput);
    if (!result.success) throw new TRPCError({ code: "BAD_REQUEST" });

    const surveyId = result.data[surveyIdKey];
    if (typeof surveyId !== "string") throw new TRPCError({ code: "BAD_REQUEST" });

    const survey = await ctx.db.query.surveys.findFirst({
      where: (surveys, { and, eq }) => and(eq(surveys.id, surveyId), eq(surveys.userId, ctx.session.user.id)),
    });
    if (!survey) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next({ ctx: { survey } });
  });
