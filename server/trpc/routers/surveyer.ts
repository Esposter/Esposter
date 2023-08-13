import { AzureTable } from "@/models/azure/table";
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
      deletedAt: null,
    });
    const surveyClient = await getTableClient(AzureTable.Surveys);
    await createEntity<SurveyEntity>(surveyClient, newSurvey);
    return newSurvey;
  }),
  updateSurvey: authedProcedure.input(updateSurveyInputSchema).mutation(async ({ input, ctx }) => {
    const surveyClient = await getTableClient(AzureTable.Surveys);
    const existingSurvey = await getEntity(surveyClient, SurveyEntity, ctx.session.user.id, input.rowKey);
    input.modelVersion++;
    if (input.modelVersion <= existingSurvey.modelVersion)
      throw new Error("Could not update existing survey with old model version");

    await updateEntity<SurveyEntity>(surveyClient, {
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
});
