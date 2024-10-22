import type { Survey } from "@/db/schema/surveys";
import type { z } from "zod";

import { db } from "@/db";
import { selectSurveySchema, surveys } from "@/db/schema/surveys";
import { AzureContainer } from "@/models/azure/blob";
import { DatabaseEntityType } from "@/models/shared/entity/DatabaseEntityType";
import { createOffsetPaginationParamsSchema } from "@/models/shared/pagination/offset/OffsetPaginationParams";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure/authedProcedure";
import { getContainerClient, uploadBlockBlob } from "@/services/azure/blob";
import { getOffsetPaginationData } from "@/services/shared/pagination/offset/getOffsetPaginationData";
import { parseSortByToSql } from "@/services/shared/pagination/sorting/parseSortByToSql";
import { getPublishPath } from "@/services/shared/publish/getPublishPath";
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
      (await db.select({ count: count() }).from(surveys).where(eq(surveys.userId, ctx.session.user.id)))[0].count,
  ),
  createSurvey: authedProcedure.input(createSurveyInputSchema).mutation<null | Survey>(async ({ ctx, input }) => {
    const createdAt = new Date();
    const newSurvey = (
      await db
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
      await db
        .delete(surveys)
        .where(and(eq(surveys.id, input), eq(surveys.userId, ctx.session.user.id)))
        .returning()
    ).find(Boolean);
    return deletedSurvey ?? null;
  }),
  publishSurvey: authedProcedure.input(publishSurveyInputSchema).mutation(async ({ ctx, input: { id, ...rest } }) => {
    const survey = await db.query.surveys.findFirst({
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

    await db.update(surveys).set(rest).where(eq(surveys.id, id));

    const client = await getContainerClient(AzureContainer.SurveyerAssets);
    const blobName = getPublishPath(id, rest.publishVersion, "json");
    await uploadBlockBlob(client, blobName, survey.model);
  }),
  readSurvey: authedProcedure
    .input(readSurveyInputSchema)
    .query(({ input }) => db.query.surveys.findFirst({ where: (surveys, { eq }) => eq(surveys.id, input) })),
  readSurveys: authedProcedure
    .input(readSurveysInputSchema)
    .query(async ({ ctx, input: { limit, offset, sortBy } }) => {
      const resultSurveys = await db.query.surveys.findMany({
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
      const survey = await db.query.surveys.findFirst({
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

      const updatedSurvey = (await db.update(surveys).set(rest).where(eq(surveys.id, id)).returning()).find(Boolean);
      return updatedSurvey ?? null;
    }),
});
