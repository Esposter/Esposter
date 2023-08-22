import { AzureTable } from "@/models/azure/table";
import { PublishedSurveyEntity, publishedSurveySchema } from "@/models/surveyer/PublishedSurveyEntity";
import { SurveyEntity, surveySchema } from "@/models/surveyer/SurveyEntity";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure";
import {
  createEntity,
  deleteEntity,
  getEntity,
  getTableClient,
  getTopNEntities,
  updateEntity,
} from "@/services/azure/table";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const readSurveysInputSchema = z.object({ cursor: z.string().nullable() });
export type ReadSurveysInput = z.infer<typeof readSurveysInputSchema>;

const createSurveyInputSchema = surveySchema.pick({ name: true, group: true, model: true });
export type CreateSurveyInput = z.infer<typeof createSurveyInputSchema>;

const updateSurveyInputSchema = surveySchema
  .pick({ rowKey: true, modelVersion: true })
  .merge(surveySchema.partial().pick({ name: true, group: true, model: true }));
export type UpdateSurveyInput = z.infer<typeof updateSurveyInputSchema>;

const deleteSurveyInputSchema = surveySchema.pick({ rowKey: true });
export type DeleteSurveyInput = z.infer<typeof deleteSurveyInputSchema>;

const publishSurveyInputSchema = publishedSurveySchema.pick({ rowKey: true, publishVersion: true });
export type PublishSurveyInput = z.infer<typeof publishSurveyInputSchema>;

export const surveyerRouter = router({
  readSurveys: authedProcedure.input(readSurveysInputSchema).query(async ({ input: { cursor }, ctx }) => {
    let filter = `PartitionKey eq '${ctx.session.user.id}'`;
    if (cursor) filter += ` and RowKey gt '${cursor}'`;
    const surveyClient = await getTableClient(AzureTable.Surveys);
    const surveys = await getTopNEntities(surveyClient, READ_LIMIT + 1, SurveyEntity, { filter });
    return { surveys, nextCursor: getNextCursor(surveys, "rowKey", READ_LIMIT) };
  }),
  createSurvey: authedProcedure.input(createSurveyInputSchema).mutation(async ({ input, ctx }) => {
    const createdAt = new Date();
    const newSurvey = new SurveyEntity({
      ...input,
      partitionKey: ctx.session.user.id,
      rowKey: uuidv4(),
      modelVersion: 1,
      createdAt,
      updatedAt: createdAt,
    });
    const surveyClient = await getTableClient(AzureTable.Surveys);
    await createEntity(surveyClient, newSurvey);
    return newSurvey;
  }),
  updateSurvey: authedProcedure.input(updateSurveyInputSchema).mutation(async ({ input, ctx }) => {
    const surveyClient = await getTableClient(AzureTable.Surveys);
    const survey = await getEntity(surveyClient, SurveyEntity, ctx.session.user.id, input.rowKey);
    if (!survey) throw new Error("Cannot find survey");

    if (input.model !== survey.model) {
      input.modelVersion++;
      if (input.modelVersion <= survey.modelVersion)
        throw new Error("Cannot not update survey model with old model version");
    }

    await updateEntity(surveyClient, {
      ...input,
      partitionKey: ctx.session.user.id,
      updatedAt: new Date(),
    });
    return input;
  }),
  deleteSurvey: authedProcedure.input(deleteSurveyInputSchema).mutation(async ({ input, ctx }) => {
    const surveyClient = await getTableClient(AzureTable.Surveys);
    await deleteEntity(surveyClient, ctx.session.user.id, input.rowKey);
  }),
  publishSurvey: authedProcedure.input(publishSurveyInputSchema).mutation(async ({ input, ctx }) => {
    const [surveyClient, publishedSurveyClient] = await Promise.all([
      getTableClient(AzureTable.Surveys),
      getTableClient(AzureTable.PublishedSurveys),
    ]);
    const [survey, publishedSurvey] = await Promise.all([
      getEntity(surveyClient, SurveyEntity, ctx.session.user.id, input.rowKey),
      getEntity(publishedSurveyClient, PublishedSurveyEntity, ctx.session.user.id, input.rowKey),
    ]);
    if (!survey) throw new Error("Cannot find survey");
    if (!publishedSurvey) {
      const newPublishedSurvey = new PublishedSurveyEntity(survey);
      await createEntity(publishedSurveyClient, newPublishedSurvey);
      return;
    }

    input.publishVersion++;
    if (input.publishVersion <= publishedSurvey.publishVersion)
      throw new Error("Cannot not update survey publish with old publish version");

    await updateEntity(publishedSurveyClient, {
      ...input,
      partitionKey: ctx.session.user.id,
      publishedAt: new Date(),
    });
  }),
});
