import type { CountSurveyResponsesOutput } from "#shared/models/resource/survey/CountSurveyResponsesOutput";
import type { SurveyResponseRecords } from "#shared/models/resource/survey/SurveyResponseRecords";
import type { FileSasEntity } from "@esposter/db-schema";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { countSurveyResponses } from "@@/server/services/survey/countSurveyResponses";
import { invalidParticipantTokenError } from "@@/server/services/survey/invalidParticipantTokenError";
import { readSurveyResponseRecords } from "@@/server/services/survey/readSurveyResponseRecords";
import { resolveSurveyResponseRead } from "@@/server/services/survey/resolveSurveyResponseRead";
import { resolveSurveyResponseWrite } from "@@/server/services/survey/resolveSurveyResponseWrite";
import { transformPublicReadSurvey } from "@@/server/services/survey/transformPublicReadSurvey";
import { transformPublishedSurvey } from "@@/server/services/survey/transformPublishedSurvey";
import { transformReadSurvey } from "@@/server/services/survey/transformReadSurvey";
import { router } from "@@/server/trpc";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { createResourceProcedures } from "@@/server/trpc/procedure/resource/createResourceProcedures";
import { getOwnerProcedure } from "@@/server/trpc/procedure/resource/getOwnerProcedure";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";
import {
  createEntity,
  deleteEntity,
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

const readSurveyResponseInputSchema = surveyResponseEntitySchema.pick({
  participantToken: true,
  partitionKey: true,
  rowKey: true,
});

const createSurveyResponseInputSchema = surveyResponseEntitySchema.pick({
  model: true,
  participantToken: true,
  partitionKey: true,
  rowKey: true,
});

const updateSurveyResponseInputSchema = surveyResponseEntitySchema.pick({
  model: true,
  modelVersion: true,
  participantToken: true,
  partitionKey: true,
  rowKey: true,
});

const deleteSurveyResponseInputSchema = surveyResponseEntitySchema.pick({ rowKey: true }).extend({
  // The partition key is the survey id, derived from this owner-checked id — never accepted from the caller
  id: selectResourceSchema.shape.id,
});

const countSurveyResponsesInputSchema = selectResourceSchema.pick({ id: true });

export const surveyRouter = router({
  ...createResourceProcedures(ResourceType.Survey, {
    transformPublicReadContent: transformPublicReadSurvey,
    transformPublishedContent: transformPublishedSurvey,
    transformReadContent: transformReadSurvey,
  }),
  countSurveyResponses: getOwnerProcedure(
    ResourceType.Survey,
    countSurveyResponsesInputSchema,
    "id",
  ).query<CountSurveyResponsesOutput>(({ ctx }) => countSurveyResponses(ctx.resource.id)),
  createSurveyResponse: standardRateLimitedProcedure
    .input(createSurveyResponseInputSchema)
    .mutation<SurveyResponseEntity>(async ({ ctx, input }) => {
      const participantToken = await resolveSurveyResponseWrite(ctx.db, input.partitionKey, input.participantToken);
      const surveyResponseClient = await useTableClient(AzureTable.SurveyResponses);
      const newSurveyResponse = new SurveyResponseEntity({ ...input, participantToken });
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
  deleteSurveyResponse: getOwnerProcedure(ResourceType.Survey, deleteSurveyResponseInputSchema, "id").mutation(
    async ({ ctx, input: { rowKey } }) => {
      const surveyResponseClient = await useTableClient(AzureTable.SurveyResponses);
      // Existence is proven before deleting so a second delete of the same key errors rather than silently passing
      await requireEntity(
        getEntity(surveyResponseClient, SurveyResponseEntity, ctx.resource.id, rowKey),
        AzureEntityType.SurveyResponse,
        JSON.stringify({ partitionKey: ctx.resource.id, rowKey }),
      );
      await deleteEntity(surveyResponseClient, ctx.resource.id, rowKey);
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
    .query<null | SurveyResponseEntity>(async ({ ctx, input: { participantToken, partitionKey, rowKey } }) => {
      const resolvedParticipantToken = await resolveSurveyResponseRead(ctx.db, partitionKey, participantToken);
      const surveyResponseClient = await useTableClient(AzureTable.SurveyResponses);
      const surveyResponse = await getEntity(surveyResponseClient, SurveyResponseEntity, partitionKey, rowKey);
      if (!surveyResponse) return null;
      // A resume must present the identity the response was started with, so another participant's row is
      // Indistinguishable from one that does not exist. Only Identified mode resolves a token to compare —
      // Anonymous carries no identity to contradict, so a survey switched to it still resumes its
      // Identified-era responses, exactly as the write boundary treats them
      if (resolvedParticipantToken && resolvedParticipantToken !== surveyResponse.participantToken) return null;
      return surveyResponse;
    }),
  // The dataset contract carries no keys, so the blade reads rows keyed through its own procedure —
  // A blade-local read concern, not a Dataset shape change
  readSurveyResponseRecords: getOwnerProcedure(
    ResourceType.Survey,
    countSurveyResponsesInputSchema,
    "id",
  ).query<SurveyResponseRecords>(({ ctx }) => readSurveyResponseRecords(ctx.resource.id)),
  updateSurveyResponse: standardRateLimitedProcedure
    .input(updateSurveyResponseInputSchema)
    .mutation<SurveyResponseEntity>(async ({ ctx, input }) => {
      const participantToken = await resolveSurveyResponseWrite(ctx.db, input.partitionKey, input.participantToken);
      const surveyResponseClient = await useTableClient(AzureTable.SurveyResponses);
      const surveyResponse = await requireEntity(
        getEntity(surveyResponseClient, SurveyResponseEntity, input.partitionKey, input.rowKey),
        AzureEntityType.SurveyResponse,
        JSON.stringify({ partitionKey: input.partitionKey, rowKey: input.rowKey }),
      );
      // A resume must carry the identity it started with, so swapping tokens mid-response is a forgery.
      // Only Identified mode resolves a token to compare — Anonymous carries no identity to contradict
      if (participantToken && participantToken !== surveyResponse.participantToken)
        throw invalidParticipantTokenError();
      // Response models are plain records, so duplicates are detected structurally rather than by reference
      if (JSON.stringify(input.model) === JSON.stringify(surveyResponse.model))
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

      // The resolved token is written, never the caller's — a stale token cannot ride an Anonymous write
      const updatedSurveyResponse = { ...input, participantToken };
      await updateEntity(surveyResponseClient, updatedSurveyResponse);
      return Object.assign(surveyResponse, updatedSurveyResponse);
    }),
});
