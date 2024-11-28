import type { Survey } from "#shared/db/schema/surveys";
import type { z } from "zod";

import { selectSurveySchema, surveys } from "#shared/db/schema/surveys";
import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { uploadBlockBlob } from "@@/server/services/azure/blob/uploadBlockBlob";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { getPublishPath } from "@@/server/services/publish/getPublishPath";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { useContainerClient } from "@@/server/util/azure/useContainerClient";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { and, count, desc, eq } from "drizzle-orm";

const readSurveyInputSchema = selectSurveySchema.shape.id;
export type ReadSurveyInput = z.infer<typeof readSurveyInputSchema>;

const readSurveysInputSchema = createOffsetPaginationParamsSchema(selectSurveySchema.keyof()).default({});
export type ReadSurveysInput = z.infer<typeof readSurveysInputSchema>;

const createSurveyInputSchema = selectSurveySchema.pick({ group: true, model: true, name: true });
export type CreateSurveyInput = z.infer<typeof createSurveyInputSchema>;

const updateSurveyInputSchema = selectSurveySchema
  .pick({ id: true, modelVersion: true })
  .merge(selectSurveySchema.partial().pick({ group: true, model: true, name: true }));
export type UpdateSurveyInput = z.infer<typeof updateSurveyInputSchema>;

const deleteSurveyInputSchema = selectSurveySchema.shape.id;
export type DeleteSurveyInput = z.infer<typeof deleteSurveyInputSchema>;

const publishSurveyInputSchema = selectSurveySchema.pick({ id: true, publishVersion: true });
export type PublishSurveyInput = z.infer<typeof publishSurveyInputSchema>;

export const surveyRouter = router({
  count: authedProcedure.query(
    async ({ ctx }) =>
      (await ctx.db.select({ count: count() }).from(surveys).where(eq(surveys.userId, ctx.session.user.id)))[0].count,
  ),
  createSurvey: authedProcedure.input(createSurveyInputSchema).mutation<null | Survey>(async ({ ctx, input }) => {
    const createdAt = new Date();
    const newSurvey = (
      await ctx.db
        .insert(surveys)
        .values({
          ...input,
          createdAt,
          modelVersion: 1,
          updatedAt: createdAt,
          userId: ctx.session.user.id,
        })
        .returning()
    ).find(Boolean);
    return newSurvey ?? null;
  }),
  deleteSurvey: authedProcedure.input(deleteSurveyInputSchema).mutation<null | Survey>(async ({ ctx, input }) => {
    const deletedSurvey = (
      await ctx.db
        .delete(surveys)
        .where(and(eq(surveys.id, input), eq(surveys.userId, ctx.session.user.id)))
        .returning()
    ).find(Boolean);
    return deletedSurvey ?? null;
  }),
  publishSurvey: authedProcedure.input(publishSurveyInputSchema).mutation(async ({ ctx, input: { id, ...rest } }) => {
    const survey = await ctx.db.query.surveys.findFirst({
      where: (surveys, { and, eq }) => and(eq(surveys.id, id), eq(surveys.userId, ctx.session.user.id)),
    });
    if (!survey) throw new NotFoundError(DatabaseEntityType.Survey, id);

    rest.publishVersion++;
    if (rest.publishVersion <= survey.publishVersion)
      throw new InvalidOperationError(
        Operation.Update,
        DatabaseEntityType.Survey,
        "cannot update survey publish with old publish version",
      );

    await ctx.db.update(surveys).set(rest).where(eq(surveys.id, id));

    const client = await useContainerClient(AzureContainer.SurveyerAssets);
    const blobName = getPublishPath(id, rest.publishVersion, "json");
    await uploadBlockBlob(client, blobName, survey.model);
  }),
  readSurvey: authedProcedure
    .input(readSurveyInputSchema)
    .query(({ ctx, input }) => ctx.db.query.surveys.findFirst({ where: (surveys, { eq }) => eq(surveys.id, input) })),
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
    .mutation<null | Survey>(async ({ ctx, input: { id, ...rest } }) => {
      const survey = await ctx.db.query.surveys.findFirst({
        where: (surveys, { and, eq }) => and(eq(surveys.id, id), eq(surveys.userId, ctx.session.user.id)),
      });
      if (!survey) throw new NotFoundError(DatabaseEntityType.Survey, id);

      if (rest.model !== survey.model) {
        rest.modelVersion++;
        if (rest.modelVersion <= survey.modelVersion)
          throw new InvalidOperationError(
            Operation.Update,
            DatabaseEntityType.Survey,
            "cannot update survey model with old model version",
          );
      }

      const updatedSurvey = (await ctx.db.update(surveys).set(rest).where(eq(surveys.id, id)).returning()).find(
        Boolean,
      );
      return updatedSurvey ?? null;
    }),
});
