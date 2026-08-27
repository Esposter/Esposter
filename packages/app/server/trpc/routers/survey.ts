import type { CountSurveyResponsesOutput } from "#shared/models/resource/survey/CountSurveyResponsesOutput";
import type { SurveyResponseRecords } from "#shared/models/resource/survey/SurveyResponseRecords";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { transformPublishedBlobUrls } from "@@/server/services/resource/transformPublishedBlobUrls";
import { countSurveyResponses } from "@@/server/services/survey/countSurveyResponses";
import { invalidParticipantTokenError } from "@@/server/services/survey/invalidParticipantTokenError";
import { readSurveyResponseRecords } from "@@/server/services/survey/readSurveyResponseRecords";
import { resolveSurveyResponseRead } from "@@/server/services/survey/resolveSurveyResponseRead";
import { resolveSurveyResponseWrite } from "@@/server/services/survey/resolveSurveyResponseWrite";
import { transformPublicReadSurvey } from "@@/server/services/survey/transformPublicReadSurvey";
import { router } from "@@/server/trpc";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { createResourceProcedures } from "@@/server/trpc/procedure/resource/createResourceProcedures";
import { getOwnerProcedure } from "@@/server/trpc/procedure/resource/getOwnerProcedure";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";
import { createEntity, getEntity, updateEntity } from "@esposter/db";
import {
  AzureEntityType,
  AzureTable,
  ResourceType,
  selectResourceSchema,
  SurveyResponseEntity,
  surveyResponseEntitySchema,
} from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

const readSurveyResponseInputSchema = surveyResponseEntitySchema.pick({
  participantToken: true,
  partitionKey: true,
  rowKey: true,
});

const createSurveyResponseInputSchema = surveyResponseEntitySchema.pick({
  model: true,
  pageNo: true,
  participantToken: true,
  partitionKey: true,
  rowKey: true,
});

const updateSurveyResponseInputSchema = surveyResponseEntitySchema.pick({
  model: true,
  modelVersion: true,
  pageNo: true,
  participantToken: true,
  partitionKey: true,
  rowKey: true,
});

const deleteSurveyResponseInputSchema = surveyResponseEntitySchema.pick({ rowKey: true }).extend({
  // The partition key is the survey id, derived from this owner-checked id — never accepted from the caller
  id: selectResourceSchema.shape.id,
});

const surveyIdInputSchema = selectResourceSchema.pick({ id: true });

export const surveyRouter = router({
  // Survey uploads come from the shared fileAssets capability rather than a bespoke set here —
  // See ResourceDefinitionMap
  ...createResourceProcedures(ResourceType.Survey, {
    transformPublicReadContent: transformPublicReadSurvey,
    transformPublishedContent: transformPublishedBlobUrls,
  }),
  countSurveyResponses: getOwnerProcedure(
    ResourceType.Survey,
    surveyIdInputSchema,
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
  deleteSurveyResponse: getOwnerProcedure(ResourceType.Survey, deleteSurveyResponseInputSchema, "id").mutation<void>(
    async ({ ctx, input: { rowKey } }) => {
      const surveyResponseClient = await useTableClient(AzureTable.SurveyResponses);
      // Existence is proven before deleting so a second delete of the same key errors rather than silently passing
      await requireEntity(
        getEntity(surveyResponseClient, SurveyResponseEntity, ctx.resource.id, rowKey),
        AzureEntityType.SurveyResponse,
        JSON.stringify({ partitionKey: ctx.resource.id, rowKey }),
      );
      await surveyResponseClient.deleteEntity(ctx.resource.id, rowKey);
    },
  ),
  readSurveyResponse: standardRateLimitedProcedure
    .input(readSurveyResponseInputSchema)
    .query<SurveyResponseEntity | undefined>(async ({ ctx, input: { participantToken, partitionKey, rowKey } }) => {
      const resolvedParticipantToken = await resolveSurveyResponseRead(ctx.db, partitionKey, participantToken);
      const surveyResponseClient = await useTableClient(AzureTable.SurveyResponses);
      const surveyResponse = await getEntity(surveyResponseClient, SurveyResponseEntity, partitionKey, rowKey);
      if (!surveyResponse) return undefined;
      // A resume must present the identity the response was started with, so another participant's row is
      // Indistinguishable from one that does not exist. Only Identified mode resolves a token to compare —
      // Anonymous carries no identity to contradict, so a survey switched to it still resumes its
      // Identified-era responses, exactly as the write boundary treats them
      if (resolvedParticipantToken && resolvedParticipantToken !== surveyResponse.participantToken) return undefined;
      return surveyResponse;
    }),
  // The dataset contract carries no keys, so the blade reads rows keyed through its own procedure —
  // A blade-local read concern, not a Dataset shape change
  readSurveyResponseRecords: getOwnerProcedure(
    ResourceType.Survey,
    surveyIdInputSchema,
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
      // Response models are plain records, so duplicates are detected structurally rather than by reference.
      // A page-only write persists only when it advances the resume position — identical answers on the same
      // Or an earlier page is a no-op (and must not regress a stored later page)
      if (JSON.stringify(input.model) === JSON.stringify(surveyResponse.model) && input.pageNo <= surveyResponse.pageNo)
        throw getInvalidOperationError(Operation.Update, AzureEntityType.SurveyResponse, "duplicate model");

      input.modelVersion++;
      if (input.modelVersion <= surveyResponse.modelVersion)
        throw getInvalidOperationError(
          Operation.Update,
          AzureEntityType.SurveyResponse,
          "cannot update survey response model with old model version",
        );
      // The resolved token is written, never the caller's — a stale token cannot ride an Anonymous write.
      // An empty resolution keeps the identity the response was created with, so a live switch to
      // Anonymous never erases who answered from the program funnel
      const updatedSurveyResponse = { ...input, participantToken: participantToken || surveyResponse.participantToken };
      await updateEntity(surveyResponseClient, updatedSurveyResponse);
      return Object.assign(surveyResponse, updatedSurveyResponse);
    }),
});
