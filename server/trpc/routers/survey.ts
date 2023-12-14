import { db } from "@/db";
import { selectSurveySchema, surveys } from "@/db/schema/surveys";
import { AzureContainer } from "@/models/azure/blob";
import { createOffsetPaginationParamsSchema } from "@/models/shared/pagination/OffsetPaginationParams";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure";
import { getContainerClient, uploadBlockBlob } from "@/services/azure/blob";
import { convertColumnsMapSortByToSql } from "@/services/shared/pagination/convertColumnsMapSortByToSql";
import { getOffsetPaginationData } from "@/services/shared/pagination/getOffsetPaginationData";
import { getPublishPath } from "@/services/shared/publish/getPublishPath";
import { and, count, eq } from "drizzle-orm";
import { z } from "zod";

const readSurveysInputSchema = createOffsetPaginationParamsSchema(selectSurveySchema.keyof()).default({});
export type ReadSurveysInput = z.infer<typeof readSurveysInputSchema>;

const createSurveyInputSchema = selectSurveySchema.pick({ name: true, group: true, model: true });
export type CreateSurveyInput = z.infer<typeof createSurveyInputSchema>;

const updateSurveyInputSchema = selectSurveySchema
  .pick({ id: true, modelVersion: true })
  .merge(selectSurveySchema.partial().pick({ name: true, group: true, model: true }));
export type UpdateSurveyInput = z.infer<typeof updateSurveyInputSchema>;

const deleteSurveyInputSchema = selectSurveySchema.shape.id;
export type DeleteSurveyInput = z.infer<typeof deleteSurveyInputSchema>;

const publishSurveyInputSchema = selectSurveySchema.pick({ id: true, publishVersion: true });
export type PublishSurveyInput = z.infer<typeof publishSurveyInputSchema>;

export const surveyRouter = router({
  count: authedProcedure.query(
    async ({ ctx }) =>
      (await db.select({ count: count() }).from(surveys).where(eq(surveys.creatorId, ctx.session.user.id)))[0].count,
  ),
  readSurveys: authedProcedure
    .input(readSurveysInputSchema)
    .query(async ({ input: { offset, limit, sortBy }, ctx }) => {
      const surveys = await db.query.surveys.findMany({
        where: (surveys) => eq(surveys.creatorId, ctx.session.user.id),
        orderBy: (surveys, { desc }) =>
          sortBy.length > 0 ? convertColumnsMapSortByToSql(surveys, sortBy) : desc(surveys.updatedAt),
        offset,
        limit: limit + 1,
      });
      return getOffsetPaginationData(surveys, limit);
    }),
  createSurvey: authedProcedure.input(createSurveyInputSchema).mutation(async ({ input, ctx }) => {
    const createdAt = new Date();
    const newSurvey = (
      await db
        .insert(surveys)
        .values({
          ...input,
          creatorId: ctx.session.user.id,
          modelVersion: 1,
          createdAt,
          updatedAt: createdAt,
        })
        .returning()
    )[0];
    return newSurvey;
  }),
  updateSurvey: authedProcedure.input(updateSurveyInputSchema).mutation(async ({ input: { id, ...rest }, ctx }) => {
    const survey = await db.query.surveys.findFirst({
      where: (surveys, { and, eq }) => and(eq(surveys.id, id), eq(surveys.creatorId, ctx.session.user.id)),
    });
    if (!survey) throw new Error("Cannot find survey");

    if (rest.model !== survey.model) {
      rest.modelVersion++;
      if (rest.modelVersion <= survey.modelVersion)
        throw new Error("Cannot update survey model with old model version");
    }

    const updatedSurvey = (await db.update(surveys).set(rest).where(eq(surveys.id, id)).returning())[0];
    return updatedSurvey;
  }),
  deleteSurvey: authedProcedure.input(deleteSurveyInputSchema).mutation(async ({ input, ctx }) => {
    await db.delete(surveys).where(and(eq(surveys.id, input), eq(surveys.creatorId, ctx.session.user.id)));
  }),
  publishSurvey: authedProcedure.input(publishSurveyInputSchema).mutation(async ({ input: { id, ...rest }, ctx }) => {
    const survey = await db.query.surveys.findFirst({
      where: (surveys, { and, eq }) => and(eq(surveys.id, id), eq(surveys.creatorId, ctx.session.user.id)),
    });
    if (!survey) throw new Error("Cannot find survey");

    rest.publishVersion++;
    if (rest.publishVersion <= survey.publishVersion)
      throw new Error("Cannot update survey publish with old publish version");

    await db.update(surveys).set(rest).where(eq(surveys.id, id));

    const client = await getContainerClient(AzureContainer.SurveyerAssets);
    const blobName = getPublishPath(id, rest.publishVersion, "json");
    await uploadBlockBlob(client, blobName, survey.model);
  }),
});
