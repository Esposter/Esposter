import { db } from "@/db";
import { selectSurveySchema, surveys } from "@/db/schema/surveys";
import { createPaginationSchema } from "@/models/shared/pagination/Pagination";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure";
import { convertColumnsMapSortByToSql } from "@/services/shared/pagination/convertColumnsMapSortByToSql";
import { getPaginationData } from "@/services/shared/pagination/getPaginationData";
import { and, eq, gt } from "drizzle-orm";
import { z } from "zod";

// Azure table storage does not support order by
const readSurveysInputSchema = createPaginationSchema(selectSurveySchema.keyof()).default({});
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
  readSurveys: authedProcedure.input(readSurveysInputSchema).query(async ({ input: { cursor, limit, sortBy } }) => {
    const surveys = await db.query.surveys.findMany({
      where: cursor ? (surveys) => gt(surveys.id, cursor) : undefined,
      orderBy: (surveys, { desc }) =>
        sortBy.length > 0 ? convertColumnsMapSortByToSql(surveys, sortBy) : desc(surveys.updatedAt),
      limit: limit + 1,
    });
    return getPaginationData(surveys, "id", limit);
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

    // @TODO: Publish the survey
    // const publishedSurveyClient = await getTableClient(AzureTable.PublishedSurveys);
    // const publishedSurveyRowKey = getPublishedSurveyRowKey(rest.rowKey, input.publishVersion);
    // const publishedSurvey = await getEntity(
    //   publishedSurveyClient,
    //   SurveyEntity,
    //   ctx.session.user.id,
    //   publishedSurveyRowKey,
    // );
    // if (publishedSurvey) throw new Error("Found existing survey publish with current publish version");

    // const publishedAt = new Date();
    // await createEntity(publishedSurveyClient, { ...survey, rowKey: publishedSurveyRowKey, publishedAt });
  }),
});
