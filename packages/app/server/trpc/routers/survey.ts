import type { FileSasEntity, Survey } from "@esposter/db-schema";

import { createSurveyInputSchema } from "#shared/models/db/survey/CreateSurveyInput";
import { deleteSurveyInputSchema } from "#shared/models/db/survey/DeleteSurveyInput";
import { updateSurveyInputSchema } from "#shared/models/db/survey/UpdateSurveyInput";
import { updateSurveyModelInputSchema } from "#shared/models/db/survey/UpdateSurveyModelInput";
import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { useUpdateBlobUrls } from "@@/server/composables/survey/useUpdateBlobUrls";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { SURVEY_MODEL_FILENAME } from "@@/server/services/survey/constants";
import { extractBlobUrls } from "@@/server/services/survey/extractBlobUrls";
import { getPublishDirectory } from "@@/server/services/survey/getPublishDirectory";
import { router } from "@@/server/trpc";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";
import { getCreatorProcedure } from "@@/server/trpc/procedure/survey/getCreatorProcedure";
import {
  cloneBlobUrls,
  createEntity,
  deleteDirectory,
  generateDownloadFileSasUrls,
  generateUploadFileSasEntities,
  getEntity,
  updateEntity,
} from "@esposter/db";
import {
  AzureContainer,
  AzureEntityType,
  AzureTable,
  DatabaseEntityType,
  fileEntitySchema,
  selectSurveySchema,
  SurveyResponseEntity,
  surveyResponseEntitySchema,
  surveys,
} from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, count, eq } from "drizzle-orm";
import { z } from "zod";

const readSurveyInputSchema = z.object({ id: selectSurveySchema.shape.id });

const readSurveysInputSchema = createOffsetPaginationParamsSchema(selectSurveySchema.keyof()).prefault({});

const readSurveyModelInputSchema = selectSurveySchema.shape.id;

const generateUploadFileSasEntitiesInputSchema = z.object({
  files: fileEntitySchema.pick({ filename: true, mimetype: true }).array().min(1).max(MAX_READ_LIMIT),
  surveyId: selectSurveySchema.shape.id,
});

const generateDownloadFileSasUrlsInputSchema = z.object({
  files: fileEntitySchema.pick({ filename: true, id: true, mimetype: true }).array().min(1).max(MAX_READ_LIMIT),
  surveyId: selectSurveySchema.shape.id,
});

const deleteFileInputSchema = z.object({
  blobPath: z.string().min(1).max(MAX_READ_LIMIT),
  surveyId: selectSurveySchema.shape.id,
});

const publishSurveyInputSchema = selectSurveySchema.pick({ id: true, publishVersion: true });

const readSurveyResponseInputSchema = surveyResponseEntitySchema.pick({ partitionKey: true, rowKey: true });

const createSurveyResponseInputSchema = surveyResponseEntitySchema.pick({
  model: true,
  partitionKey: true,
  rowKey: true,
});

const updateSurveyResponseInputSchema = surveyResponseEntitySchema.pick({
  model: true,
  modelVersion: true,
  partitionKey: true,
  rowKey: true,
});

export const surveyRouter = router({
  count: standardAuthedProcedure.query(
    async ({ ctx }) =>
      takeOne(
        await ctx.db.select({ count: count() }).from(surveys).where(eq(surveys.userId, ctx.getSessionPayload.user.id)),
      ).count,
  ),
  createSurvey: standardAuthedProcedure.input(createSurveyInputSchema).mutation<Survey>(async ({ ctx, input }) => {
    const newSurvey = requireMutation(
      (
        await ctx.db
          .insert(surveys)
          .values({ ...input, userId: ctx.getSessionPayload.user.id })
          .returning()
      )[0],
      Operation.Create,
      DatabaseEntityType.Survey,
      ctx.getSessionPayload.user.id,
    );

    const blobName = `${newSurvey.id}/${SURVEY_MODEL_FILENAME}`;
    await useUpload(AzureContainer.SurveyAssets, blobName, newSurvey.model);
    return newSurvey;
  }),
  createSurveyResponse: standardRateLimitedProcedure
    .input(createSurveyResponseInputSchema)
    .mutation<SurveyResponseEntity>(async ({ input }) => {
      const surveyResponseClient = await useTableClient(AzureTable.SurveyResponses);
      const newSurveyResponse = new SurveyResponseEntity(input);
      await createEntity(surveyResponseClient, newSurveyResponse);
      return newSurveyResponse;
    }),
  deleteFile: getCreatorProcedure(deleteFileInputSchema, "surveyId").mutation(
    async ({ input: { blobPath, surveyId } }) => {
      const containerClient = await useContainerClient(AzureContainer.SurveyAssets);
      const blobName = `${surveyId}/${blobPath}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.delete();
    },
  ),
  deleteSurvey: standardAuthedProcedure.input(deleteSurveyInputSchema).mutation<Survey>(async ({ ctx, input }) => {
    const deletedSurvey = requireMutation(
      (
        await ctx.db
          .delete(surveys)
          .where(and(eq(surveys.id, input), eq(surveys.userId, ctx.getSessionPayload.user.id)))
          .returning()
      )[0],
      Operation.Delete,
      DatabaseEntityType.Survey,
      input,
    );

    const containerClient = await useContainerClient(AzureContainer.SurveyAssets);
    await deleteDirectory(containerClient, input, true);
    return deletedSurvey;
  }),
  generateDownloadFileSasUrls: getCreatorProcedure(generateDownloadFileSasUrlsInputSchema, "surveyId").query<string[]>(
    async ({ input: { files, surveyId } }) => {
      const containerClient = await useContainerClient(AzureContainer.SurveyAssets);
      return generateDownloadFileSasUrls(containerClient, files, surveyId);
    },
  ),
  generateUploadFileSasEntities: getCreatorProcedure(generateUploadFileSasEntitiesInputSchema, "surveyId").query<
    FileSasEntity[]
  >(async ({ input: { files, surveyId } }) => {
    const containerClient = await useContainerClient(AzureContainer.SurveyAssets);
    return generateUploadFileSasEntities(containerClient, files, surveyId);
  }),
  publishSurvey: getCreatorProcedure(publishSurveyInputSchema, "id").mutation<Survey>(
    async ({ ctx, input: { id, ...rest } }) => {
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

      const updatedSurvey = requireMutation(
        (await ctx.db.update(surveys).set(rest).where(eq(surveys.id, id)).returning())[0],
        Operation.Update,
        DatabaseEntityType.Survey,
        id,
      );

      const containerClient = await useContainerClient(AzureContainer.SurveyAssets);
      const blobUrls = extractBlobUrls(updatedSurvey.model);
      const publishDirectory = getPublishDirectory(updatedSurvey);
      await cloneBlobUrls(containerClient, blobUrls, updatedSurvey.id, publishDirectory);
      return updatedSurvey;
    },
  ),
  readSurvey: getCreatorProcedure(readSurveyInputSchema, "id").query(async ({ ctx }) => ({
    ...ctx.survey,
    model: await useUpdateBlobUrls(ctx.survey),
  })),
  readSurveyModel: standardRateLimitedProcedure
    .input(readSurveyModelInputSchema)
    .query<string>(async ({ ctx, input }) => {
      const survey = await requireEntity(
        ctx.db.query.surveys.findFirst({ where: { id: { eq: input } } }),
        DatabaseEntityType.Survey,
        input,
      );
      return useUpdateBlobUrls(survey, true);
    }),
  readSurveyResponse: standardRateLimitedProcedure
    .input(readSurveyResponseInputSchema)
    .query<null | SurveyResponseEntity>(async ({ input: { partitionKey, rowKey } }) => {
      const surveyResponseClient = await useTableClient(AzureTable.SurveyResponses);
      const surveyResponse = await getEntity(surveyResponseClient, SurveyResponseEntity, partitionKey, rowKey);
      return surveyResponse;
    }),
  readSurveys: standardAuthedProcedure
    .input(readSurveysInputSchema)
    .query(async ({ ctx, input: { limit, offset, sortBy } }) => {
      const resultSurveys = await ctx.db.query.surveys.findMany({
        columns: { model: false },
        limit: limit + 1,
        offset,
        orderBy: (surveys, { desc }) =>
          sortBy.length > 0 ? parseSortByToSql(surveys, sortBy) : desc(surveys.updatedAt),
        where: { userId: { eq: ctx.getSessionPayload.user.id } },
      });
      return getOffsetPaginationData(resultSurveys, limit);
    }),
  updateSurvey: standardAuthedProcedure
    .input(updateSurveyInputSchema)
    .mutation<Survey>(async ({ ctx, input: { id, ...rest } }) => {
      const updatedSurvey = requireMutation(
        (
          await ctx.db
            .update(surveys)
            .set(rest)
            .where(and(eq(surveys.id, id), eq(surveys.userId, ctx.getSessionPayload.user.id)))
            .returning()
        )[0],
        Operation.Update,
        DatabaseEntityType.Survey,
        id,
      );
      return updatedSurvey;
    }),
  updateSurveyModel: getCreatorProcedure(updateSurveyModelInputSchema, "id").mutation<Survey>(
    async ({ ctx, input: { id, ...rest } }) => {
      if (rest.model === ctx.survey.model)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Update, DatabaseEntityType.Survey, "duplicate model").message,
        });

      if (rest.model !== ctx.survey.model) rest.modelVersion++;
      if (rest.modelVersion <= ctx.survey.modelVersion)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(
            Operation.Update,
            DatabaseEntityType.Survey,
            "cannot update survey model with old model version",
          ).message,
        });

      const updatedSurvey = requireMutation(
        (
          await ctx.db
            .update(surveys)
            .set(rest)
            .where(and(eq(surveys.id, id), eq(surveys.userId, ctx.getSessionPayload.user.id)))
            .returning()
        )[0],
        Operation.Update,
        DatabaseEntityType.Survey,
        id,
      );

      const blobName = `${updatedSurvey.id}/${SURVEY_MODEL_FILENAME}`;
      await useUpload(AzureContainer.SurveyAssets, blobName, updatedSurvey.model);
      return updatedSurvey;
    },
  ),
  updateSurveyResponse: standardRateLimitedProcedure
    .input(updateSurveyResponseInputSchema)
    .mutation<SurveyResponseEntity>(async ({ input }) => {
      const surveyResponseClient = await useTableClient(AzureTable.SurveyResponses);
      const surveyResponse = await requireEntity(
        getEntity(surveyResponseClient, SurveyResponseEntity, input.partitionKey, input.rowKey),
        AzureEntityType.SurveyResponse,
        JSON.stringify({ partitionKey: input.partitionKey, rowKey: input.rowKey }),
      );
      if (input.model === surveyResponse.model)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Update, AzureEntityType.SurveyResponse, "duplicate model")
            .message,
        });

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

      await updateEntity(surveyResponseClient, input);
      return Object.assign(surveyResponse, input);
    }),
});
