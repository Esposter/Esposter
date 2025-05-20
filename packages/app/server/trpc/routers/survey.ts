import type { Survey } from "#shared/db/schema/surveys";
import type { FileSasEntity } from "#shared/models/esbabbler/FileSasEntity";

import { selectSurveySchema, surveys } from "#shared/db/schema/surveys";
import { AzureEntityType } from "#shared/models/azure/AzureEntityType";
import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { fileEntitySchema } from "#shared/models/azure/FileEntity";
import { createSurveyInputSchema } from "#shared/models/db/survey/CreateSurveyInput";
import { deleteSurveyInputSchema } from "#shared/models/db/survey/DeleteSurveyInput";
import { SurveyResponseEntity, surveyResponseEntitySchema } from "#shared/models/db/survey/SurveyResponseEntity";
import { updateSurveyInputSchema } from "#shared/models/db/survey/UpdateSurveyInput";
import { updateSurveyModelInputSchema } from "#shared/models/db/survey/UpdateSurveyModelInput";
import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { extractBlobUrls } from "#shared/services/surveyer/extractBlobUrls";
import { useContainerClient } from "@@/server/composables/azure/useContainerClient";
import { useTableClient } from "@@/server/composables/azure/useTableClient";
import { useUpload } from "@@/server/composables/azure/useUpload";
import { useUpdateBlobUrls } from "@@/server/composables/surveyer/useUpdateBlobUrls";
import { AzureTable } from "@@/server/models/azure/table/AzureTable";
import { cloneBlobUrls } from "@@/server/services/azure/container/cloneBlobUrls";
import { deleteDirectory } from "@@/server/services/azure/container/deleteDirectory";
import { generateDownloadFileSasUrls } from "@@/server/services/azure/container/generateDownloadFileSasUrls";
import { generateUploadFileSasEntities } from "@@/server/services/azure/container/generateUploadFileSasEntities";
import { createEntity } from "@@/server/services/azure/table/createEntity";
import { getEntity } from "@@/server/services/azure/table/getEntity";
import { updateEntity } from "@@/server/services/azure/table/updateEntity";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { SURVEY_MODEL_FILENAME } from "@@/server/services/surveyer/constants";
import { getPublishDirectory } from "@@/server/services/surveyer/getPublishDirectory";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { rateLimitedProcedure } from "@@/server/trpc/procedure/rateLimitedProcedure";
import { getCreatorProcedure } from "@@/server/trpc/procedure/survey/getCreatorProcedure";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq } from "drizzle-orm";
import { z } from "zod";

const readSurveyInputSchema = z.object({ id: selectSurveySchema.shape.id });
export type ReadSurveyInput = z.infer<typeof readSurveyInputSchema>;

const readSurveysInputSchema = createOffsetPaginationParamsSchema(selectSurveySchema.keyof()).default({});
export type ReadSurveysInput = z.infer<typeof readSurveysInputSchema>;

const readSurveyModelInputSchema = selectSurveySchema.shape.id;
export type readSurveyModelInput = z.infer<typeof readSurveyModelInputSchema>;

const generateUploadFileSasEntitiesInputSchema = z.object({
  files: fileEntitySchema.pick({ filename: true, mimetype: true }).array().min(1).max(MAX_READ_LIMIT),
  surveyId: selectSurveySchema.shape.id,
});
export type GenerateUploadFileSasEntitiesInput = z.infer<typeof generateUploadFileSasEntitiesInputSchema>;

const generateDownloadFileSasUrlsInputSchema = z.object({
  files: fileEntitySchema.pick({ filename: true, id: true, mimetype: true }).array().min(1).max(MAX_READ_LIMIT),
  surveyId: selectSurveySchema.shape.id,
});
export type GenerateDownloadFileSasUrlsInput = z.infer<typeof generateDownloadFileSasUrlsInputSchema>;

const deleteFileInputSchema = z.object({
  blobPath: z.string().min(1).max(MAX_READ_LIMIT),
  surveyId: selectSurveySchema.shape.id,
});
export type DeleteFileInput = z.infer<typeof deleteFileInputSchema>;

const publishSurveyInputSchema = selectSurveySchema.pick({ id: true, publishVersion: true });
export type PublishSurveyInput = z.infer<typeof publishSurveyInputSchema>;

const readSurveyResponseInputSchema = surveyResponseEntitySchema.pick({ partitionKey: true, rowKey: true });
export type ReadSurveyResponseInput = z.infer<typeof readSurveyResponseInputSchema>;

const createSurveyResponseInputSchema = surveyResponseEntitySchema.pick({
  model: true,
  partitionKey: true,
  rowKey: true,
});
export type CreateSurveyResponseInput = z.infer<typeof createSurveyResponseInputSchema>;

const updateSurveyResponseInputSchema = surveyResponseEntitySchema.pick({
  model: true,
  modelVersion: true,
  partitionKey: true,
  rowKey: true,
});
export type UpdateSurveyResponseInput = z.infer<typeof updateSurveyResponseInputSchema>;

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

    const blobName = `${newSurvey.id}/${SURVEY_MODEL_FILENAME}`;
    await useUpload(AzureContainer.SurveyerAssets, blobName, newSurvey.model);
    return newSurvey;
  }),
  createSurveyResponse: rateLimitedProcedure
    .input(createSurveyResponseInputSchema)
    .mutation<SurveyResponseEntity>(async ({ input }) => {
      const surveyResponseClient = await useTableClient(AzureTable.SurveyResponses);
      const newSurveyResponse = new SurveyResponseEntity(input);
      await createEntity(surveyResponseClient, newSurveyResponse);
      return newSurveyResponse;
    }),
  deleteFile: getCreatorProcedure(deleteFileInputSchema, "surveyId")
    .input(deleteFileInputSchema)
    .mutation(async ({ input: { blobPath, surveyId } }) => {
      const containerClient = await useContainerClient(AzureContainer.SurveyerAssets);
      const blobName = `${surveyId}/${blobPath}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.delete();
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

    const containerClient = await useContainerClient(AzureContainer.SurveyerAssets);
    await deleteDirectory(containerClient, input, true);
    return deletedSurvey;
  }),
  generateDownloadFileSasUrls: getCreatorProcedure(generateDownloadFileSasUrlsInputSchema, "surveyId")
    .input(generateDownloadFileSasUrlsInputSchema)
    .query<string[]>(async ({ input: { files, surveyId } }) => {
      const containerClient = await useContainerClient(AzureContainer.SurveyerAssets);
      return generateDownloadFileSasUrls(containerClient, files, surveyId);
    }),
  generateUploadFileSasEntities: getCreatorProcedure(generateUploadFileSasEntitiesInputSchema, "surveyId")
    .input(generateUploadFileSasEntitiesInputSchema)
    .query<FileSasEntity[]>(async ({ input: { files, surveyId } }) => {
      const containerClient = await useContainerClient(AzureContainer.SurveyerAssets);
      return generateUploadFileSasEntities(containerClient, files, surveyId);
    }),
  publishSurvey: getCreatorProcedure(publishSurveyInputSchema, "id")
    .input(publishSurveyInputSchema)
    .mutation<Survey>(async ({ ctx, input: { id, ...rest } }) => {
      rest.publishVersion++;
      if (rest.publishVersion <= ctx.survey.publishVersion)
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

      const containerClient = await useContainerClient(AzureContainer.SurveyerAssets);
      const blobUrls = extractBlobUrls(updatedSurvey.model);
      const publishDirectory = getPublishDirectory(updatedSurvey);
      await cloneBlobUrls(containerClient, blobUrls, updatedSurvey.id, publishDirectory);
      return updatedSurvey;
    }),
  readSurvey: getCreatorProcedure(readSurveyInputSchema, "id")
    .input(readSurveyInputSchema)
    .query(async ({ ctx }) => ({ ...ctx.survey, model: await useUpdateBlobUrls(ctx.survey) })),
  readSurveyModel: rateLimitedProcedure.input(readSurveyModelInputSchema).query<string>(async ({ ctx, input }) => {
    const survey = await ctx.db.query.surveys.findFirst({ where: (surveys, { eq }) => eq(surveys.id, input) });
    if (!survey)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: new NotFoundError(DatabaseEntityType.Survey, input).message,
      });
    return useUpdateBlobUrls(survey, true);
  }),
  readSurveyResponse: rateLimitedProcedure
    .input(readSurveyResponseInputSchema)
    .query<null | SurveyResponseEntity>(async ({ input: { partitionKey, rowKey } }) => {
      const surveyResponseClient = await useTableClient(AzureTable.SurveyResponses);
      const surveyResponse = await getEntity(surveyResponseClient, SurveyResponseEntity, partitionKey, rowKey);
      return surveyResponse;
    }),
  readSurveys: authedProcedure
    .input(readSurveysInputSchema)
    .query(async ({ ctx, input: { limit, offset, sortBy } }) => {
      const resultSurveys = await ctx.db.query.surveys.findMany({
        columns: {
          model: false,
        },
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
  updateSurveyModel: getCreatorProcedure(readSurveyInputSchema, "id")
    .input(updateSurveyModelInputSchema)
    .mutation<Survey>(async ({ ctx, input: { id, ...rest } }) => {
      if (rest.model !== ctx.survey.model) {
        rest.modelVersion++;
        if (rest.modelVersion <= ctx.survey.modelVersion)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new InvalidOperationError(
              Operation.Update,
              DatabaseEntityType.Survey,
              "cannot update survey model with old model version",
            ).message,
          });
      } else
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Update, DatabaseEntityType.Survey, "duplicate model").message,
        });

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

      const blobName = `${updatedSurvey.id}/${SURVEY_MODEL_FILENAME}`;
      await useUpload(AzureContainer.SurveyerAssets, blobName, updatedSurvey.model);
      return updatedSurvey;
    }),
  updateSurveyResponse: rateLimitedProcedure
    .input(updateSurveyResponseInputSchema)
    .mutation<SurveyResponseEntity>(async ({ input }) => {
      const surveyResponseClient = await useTableClient(AzureTable.SurveyResponses);
      const surveyResponse = await getEntity(
        surveyResponseClient,
        SurveyResponseEntity,
        input.partitionKey,
        input.rowKey,
      );
      if (!surveyResponse)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(AzureEntityType.SurveyResponse, JSON.stringify(input)).message,
        });

      if (input.model !== surveyResponse.model) {
        input.modelVersion++;
        if (input.modelVersion <= surveyResponse.modelVersion)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new InvalidOperationError(
              Operation.Update,
              DatabaseEntityType.Survey,
              "cannot update survey response model with old model version",
            ).message,
          });
      } else
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Update, AzureEntityType.SurveyResponse, "duplicate model")
            .message,
        });

      await updateEntity(surveyResponseClient, input);
      return Object.assign(surveyResponse, input);
    }),
});
