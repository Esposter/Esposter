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
import { dayjs } from "#shared/services/dayjs";
import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { useContainerClient } from "@@/server/composables/azure/useContainerClient";
import { useTableClient } from "@@/server/composables/azure/useTableClient";
import { useUpload } from "@@/server/composables/azure/useUpload";
import { AzureTable } from "@@/server/models/azure/table/AzureTable";
import { cloneDirectory } from "@@/server/services/azure/container/cloneDirectory";
import { deleteDirectory } from "@@/server/services/azure/container/deleteDirectory";
import { generateDownloadFileSasUrls } from "@@/server/services/azure/container/generateDownloadFileSasUrls";
import { generateUploadFileSasEntities } from "@@/server/services/azure/container/generateUploadFileSasEntities";
import { getVersionPath } from "@@/server/services/azure/container/getVersionPath";
import { createEntity } from "@@/server/services/azure/table/createEntity";
import { getEntity } from "@@/server/services/azure/table/getEntity";
import { updateEntity } from "@@/server/services/azure/table/updateEntity";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { PUBLISH_DIRECTORY_PATH, SURVEY_MODEL_FILENAME } from "@@/server/services/surveyer/constants";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { rateLimitedProcedure } from "@@/server/trpc/procedure/rateLimitedProcedure";
import { getCreatorProcedure } from "@@/server/trpc/procedure/survey/getCreatorProcedure";
import { ContainerSASPermissions } from "@azure/storage-blob";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq } from "drizzle-orm";
import { z } from "zod";

const readSurveyInputSchema = z.object({ id: selectSurveySchema.shape.id });
export type ReadSurveyInput = z.infer<typeof readSurveyInputSchema>;

const readSurveysInputSchema = createOffsetPaginationParamsSchema(selectSurveySchema.keyof()).default({});
export type ReadSurveysInput = z.infer<typeof readSurveysInputSchema>;

const generateSurveyModelSasUrlInputSchema = selectSurveySchema.shape.id;
export type GenerateSurveyModelSasUrlInput = z.infer<typeof generateSurveyModelSasUrlInputSchema>;

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

    const containerClient = await useContainerClient(AzureContainer.EsbabblerAssets);
    await deleteDirectory(containerClient, input, true);
    return deletedSurvey;
  }),
  generateDownloadFileSasUrls: getCreatorProcedure(generateDownloadFileSasUrlsInputSchema, "surveyId")
    .input(generateDownloadFileSasUrlsInputSchema)
    .query<string[]>(async ({ input: { files, surveyId } }) => {
      const containerClient = await useContainerClient(AzureContainer.EsbabblerAssets);
      return generateDownloadFileSasUrls(containerClient, files, surveyId);
    }),
  generateSurveyModelSasUrl: rateLimitedProcedure
    .input(generateSurveyModelSasUrlInputSchema)
    .query<string>(async ({ ctx, input }) => {
      const survey = await ctx.db.query.surveys.findFirst({ where: (surveys, { eq }) => eq(surveys.id, input) });
      if (!survey)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.Survey, input).message,
        });

      const containerClient = await useContainerClient(AzureContainer.SurveyerAssets);
      const blobName = `${getVersionPath(survey.publishVersion, `${input}/${PUBLISH_DIRECTORY_PATH}`)}/${SURVEY_MODEL_FILENAME}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      return blockBlobClient.generateSasUrl({
        contentType: "application/json",
        expiresOn: dayjs().add(30, "days").toDate(),
        permissions: ContainerSASPermissions.from({ read: true }),
      });
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
      // @TODO: We only want to clone specific blobs that are actually used by the survey
      await cloneDirectory(containerClient, id, getVersionPath(rest.publishVersion, `${id}/${PUBLISH_DIRECTORY_PATH}`));
      return updatedSurvey;
    }),
  readSurvey: getCreatorProcedure(readSurveyInputSchema, "id")
    .input(readSurveyInputSchema)
    .query(({ ctx }) => ctx.survey),
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
