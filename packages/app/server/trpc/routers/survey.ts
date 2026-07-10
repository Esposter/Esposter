import type { FileSasEntity } from "@esposter/db-schema";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { transformPublishedSurvey } from "@@/server/services/survey/transformPublishedSurvey";
import { transformReadSurvey } from "@@/server/services/survey/transformReadSurvey";
import { router } from "@@/server/trpc";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { createResourceProcedures } from "@@/server/trpc/procedure/resource/createResourceProcedures";
import { getOwnerProcedure } from "@@/server/trpc/procedure/resource/getOwnerProcedure";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";
import {
  createEntity,
  generateDownloadFileSasUrls,
  generateUploadFileSasEntities,
  getEntity,
  updateEntity,
} from "@esposter/db";
import {
  AzureContainer,
  AzureEntityType,
  AzureTable,
  fileEntitySchema,
  ResourceType,
  selectResourceSchema,
  SurveyResponseEntity,
  surveyResponseEntitySchema,
} from "@esposter/db-schema";
import { createUniqueArraySchema, InvalidOperationError, MAX_READ_LIMIT, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

// Type-owned binary assets (survey uploads) live under the standard {id}/files/… convention
const getFilesDirectoryName = (surveyId: string) => `${surveyId}/files`;

const generateUploadFileSasEntitiesInputSchema = z.object({
  files: createUniqueArraySchema(fileEntitySchema.pick({ filename: true, mimetype: true }), "filename")
    .min(1)
    .max(MAX_READ_LIMIT),
  surveyId: selectResourceSchema.shape.id,
});

const generateDownloadFileSasUrlsInputSchema = z.object({
  files: createUniqueArraySchema(fileEntitySchema.pick({ filename: true, id: true, mimetype: true }), "id")
    .min(1)
    .max(MAX_READ_LIMIT),
  surveyId: selectResourceSchema.shape.id,
});

const deleteFileInputSchema = z.object({
  blobPath: z.string().min(1).max(MAX_READ_LIMIT),
  surveyId: selectResourceSchema.shape.id,
});

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
  ...createResourceProcedures(ResourceType.Survey, {
    transformPublishedContent: transformPublishedSurvey,
    transformReadContent: transformReadSurvey,
  }),
  createSurveyResponse: standardRateLimitedProcedure
    .input(createSurveyResponseInputSchema)
    .mutation<SurveyResponseEntity>(async ({ input }) => {
      const surveyResponseClient = await useTableClient(AzureTable.SurveyResponses);
      const newSurveyResponse = new SurveyResponseEntity(input);
      await createEntity(surveyResponseClient, newSurveyResponse);
      return newSurveyResponse;
    }),
  deleteFile: getOwnerProcedure(ResourceType.Survey, deleteFileInputSchema, "surveyId").mutation(
    async ({ input: { blobPath, surveyId } }) => {
      const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
      const blobName = `${surveyId}/${blobPath}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.deleteIfExists();
    },
  ),
  generateDownloadFileSasUrls: getOwnerProcedure(
    ResourceType.Survey,
    generateDownloadFileSasUrlsInputSchema,
    "surveyId",
  ).query<string[]>(async ({ input: { files, surveyId } }) => {
    const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
    return generateDownloadFileSasUrls(containerClient, files, getFilesDirectoryName(surveyId));
  }),
  generateUploadFileSasEntities: getOwnerProcedure(
    ResourceType.Survey,
    generateUploadFileSasEntitiesInputSchema,
    "surveyId",
  ).query<FileSasEntity[]>(async ({ input: { files, surveyId } }) => {
    const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
    return generateUploadFileSasEntities(containerClient, files, getFilesDirectoryName(surveyId));
  }),
  readSurveyResponse: standardRateLimitedProcedure
    .input(readSurveyResponseInputSchema)
    .query<null | SurveyResponseEntity>(async ({ input: { partitionKey, rowKey } }) => {
      const surveyResponseClient = await useTableClient(AzureTable.SurveyResponses);
      const surveyResponse = await getEntity(surveyResponseClient, SurveyResponseEntity, partitionKey, rowKey);
      return surveyResponse;
    }),
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
            AzureEntityType.SurveyResponse,
            "cannot update survey response model with old model version",
          ).message,
        });

      await updateEntity(surveyResponseClient, input);
      return Object.assign(surveyResponse, input);
    }),
});
