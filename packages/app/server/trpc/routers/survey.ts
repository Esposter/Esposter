import type { Survey } from "#shared/db/schema/surveys";
import type { z } from "zod";

import { selectSurveySchema, surveys } from "#shared/db/schema/surveys";
import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { createSurveyInputSchema } from "#shared/models/db/survey/CreateSurveyInput";
import { deleteSurveyInputSchema } from "#shared/models/db/survey/DeleteSurveyInput";
import { updateSurveyInputSchema } from "#shared/models/db/survey/UpdateSurveyInput";
import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { useUpload } from "@@/server/composables/azure/useUpload";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { getPublishPath } from "@@/server/services/publish/getPublishPath";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq } from "drizzle-orm";

const readSurveyInputSchema = selectSurveySchema.shape.id;
export type ReadSurveyInput = z.infer<typeof readSurveyInputSchema>;

const readSurveysInputSchema = createOffsetPaginationParamsSchema(selectSurveySchema.keyof()).default({});
export type ReadSurveysInput = z.infer<typeof readSurveysInputSchema>;

const publishSurveyInputSchema = selectSurveySchema.pick({ id: true, publishVersion: true });
export type PublishSurveyInput = z.infer<typeof publishSurveyInputSchema>;

export const surveyRouter = router({
  count: authedProcedure.query(
    async ({ ctx }) =>
      (await ctx.db.select({ count: count() }).from(surveys).where(eq(surveys.userId, ctx.session.user.id)))[0].count,
  ),
  createSurvey: authedProcedure.input(createSurveyInputSchema).mutation<Survey>(async ({ ctx, input }) => {
    const newSurvey = (
      await ctx.db
        .insert(surveys)
        .values({ ...input, userId: ctx.session.user.id })
        .returning()
    ).find(Boolean);
    if (!newSurvey)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Survey, JSON.stringify(input)).message,
      });
    return newSurvey;
  }),
  deleteSurvey: authedProcedure.input(deleteSurveyInputSchema).mutation<Survey>(async ({ ctx, input }) => {
    const deletedSurvey = (
      await ctx.db
        .delete(surveys)
        .where(and(eq(surveys.id, input), eq(surveys.userId, ctx.session.user.id)))
        .returning()
    ).find(Boolean);
    if (!deletedSurvey)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Delete, DatabaseEntityType.Survey, input).message,
      });
    return deletedSurvey;
  }),
  publishSurvey: authedProcedure
    .input(publishSurveyInputSchema)
    .mutation<Survey>(async ({ ctx, input: { id, ...rest } }) => {
      const survey = await ctx.db.query.surveys.findFirst({
        where: (surveys, { and, eq }) => and(eq(surveys.id, id), eq(surveys.userId, ctx.session.user.id)),
      });
      if (!survey)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.Survey, id).message,
        });

      rest.publishVersion++;
      if (rest.publishVersion <= survey.publishVersion)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(
            Operation.Update,
            DatabaseEntityType.Survey,
            "cannot update survey publish with old publish version",
          ).message,
        });

      const updatedSurvey = (await ctx.db.update(surveys).set(rest).where(eq(surveys.id, id)).returning()).find(
        Boolean,
      );
      if (!updatedSurvey)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Update, DatabaseEntityType.Survey, JSON.stringify(rest)).message,
        });

      const blobName = getPublishPath(id, rest.publishVersion, "json");
      await useUpload(AzureContainer.SurveyerAssets, blobName, survey.model);
      return updatedSurvey;
    }),
  readSurvey: authedProcedure.input(readSurveyInputSchema).query(async ({ ctx, input }) => {
    const survey = await ctx.db.query.surveys.findFirst({ where: (surveys, { eq }) => eq(surveys.id, input) });
    if (!survey)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: new NotFoundError(DatabaseEntityType.Survey, input).message,
      });
    return survey;
  }),
  readSurveys: authedProcedure
    .input(readSurveysInputSchema)
    .query(async ({ ctx, input: { limit, offset, sortBy } }) => {
      const resultSurveys = await ctx.db.query.surveys.findMany({
        limit: limit + 1,
        offset,
        orderBy: sortBy.length > 0 ? parseSortByToSql(surveys, sortBy) : desc(surveys.updatedAt),
        where: (surveys) => eq(surveys.userId, ctx.session.user.id),
      });
      return getOffsetPaginationData(resultSurveys, limit);
    }),
  updateSurvey: authedProcedure
    .input(updateSurveyInputSchema)
    .mutation<Survey>(async ({ ctx, input: { id, ...rest } }) => {
      const survey = await ctx.db.query.surveys.findFirst({
        where: (surveys, { and, eq }) => and(eq(surveys.id, id), eq(surveys.userId, ctx.session.user.id)),
      });
      if (!survey)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.Survey, id).message,
        });

      if (rest.model !== survey.model) {
        rest.modelVersion++;
        if (rest.modelVersion <= survey.modelVersion)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new InvalidOperationError(
              Operation.Update,
              DatabaseEntityType.Survey,
              "cannot update survey model with old model version",
            ).message,
          });
      }

      const updatedSurvey = (
        await ctx.db
          .update(surveys)
          .set(rest)
          .where(and(eq(surveys.id, id), eq(surveys.userId, ctx.session.user.id)))
          .returning()
      ).find(Boolean);
      if (!updatedSurvey)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Update, DatabaseEntityType.Survey, id).message,
        });
      return updatedSurvey;
    }),
});
