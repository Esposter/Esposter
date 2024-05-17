import { db } from "@/db";
import type { Survey } from "@/db/schema/surveys";
import { selectSurveySchema, surveys } from "@/db/schema/surveys";
import { AzureContainer } from "@/models/azure/blob";
import { DatabaseEntityType } from "@/models/shared/entity/DatabaseEntityType";
import { createOffsetPaginationParamsSchema } from "@/models/shared/pagination/offset/OffsetPaginationParams";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure";
import { getContainerClient, uploadBlockBlob } from "@/services/azure/blob";
import { getOffsetPaginationData } from "@/services/shared/pagination/offset/getOffsetPaginationData";
import { parseSortByToSql } from "@/services/shared/pagination/sorting/parseSortByToSql";
import { getPublishPath } from "@/services/shared/publish/getPublishPath";
import { and, count, desc, eq } from "drizzle-orm";
import { InvalidOperationError } from "esposter-shared/models/error/InvalidOperationError";
import { NotFoundError } from "esposter-shared/models/error/NotFoundError";
import { Operation } from "esposter-shared/models/shared/Operation";
import type { z } from "zod";

const readSurveyInputSchema = selectSurveySchema.shape.id;
export type ReadSurveyInput = z.infer<typeof readSurveyInputSchema>;

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
  readSurvey: authedProcedure
    .input(readSurveyInputSchema)
    .query(({ input }) => db.query.surveys.findFirst({ where: (surveys, { eq }) => eq(surveys.id, input) })),
  readSurveys: authedProcedure
    .input(readSurveysInputSchema)
    .query(async ({ input: { offset, limit, sortBy }, ctx }) => {
      const resultSurveys = await db.query.surveys.findMany({
        where: (surveys) => eq(surveys.creatorId, ctx.session.user.id),
        orderBy: sortBy.length > 0 ? parseSortByToSql(surveys, sortBy) : desc(surveys.updatedAt),
        offset,
        limit: limit + 1,
      });
      return getOffsetPaginationData(resultSurveys, limit);
    }),
  createSurvey: authedProcedure.input(createSurveyInputSchema).mutation<Survey | null>(async ({ input, ctx }) => {
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
    ).find(Boolean);
    return newSurvey ?? null;
  }),
  updateSurvey: authedProcedure
    .input(updateSurveyInputSchema)
    .mutation<Survey | null>(async ({ input: { id, ...rest }, ctx }) => {
      const survey = await db.query.surveys.findFirst({
        where: (surveys, { and, eq }) => and(eq(surveys.id, id), eq(surveys.creatorId, ctx.session.user.id)),
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
  deleteSurvey: authedProcedure.input(deleteSurveyInputSchema).mutation<Survey | null>(async ({ input, ctx }) => {
    const deletedSurvey = (
      await db
        .delete(surveys)
        .where(and(eq(surveys.id, input), eq(surveys.creatorId, ctx.session.user.id)))
        .returning()
    ).find(Boolean);
    return deletedSurvey ?? null;
  }),
  publishSurvey: authedProcedure.input(publishSurveyInputSchema).mutation(async ({ input: { id, ...rest }, ctx }) => {
    const survey = await db.query.surveys.findFirst({
      where: (surveys, { and, eq }) => and(eq(surveys.id, id), eq(surveys.creatorId, ctx.session.user.id)),
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
});
