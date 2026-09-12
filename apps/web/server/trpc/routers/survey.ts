import type { ReadSurveyResponsesCountResult } from "#shared/models/resource/survey/ReadSurveyResponsesCountResult";
import type { SurveyResponseRecords } from "#shared/models/resource/survey/SurveyResponseRecords";

import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { createSurveyResponseInputSchema } from "#shared/models/db/survey/CreateSurveyResponseInput";
import { deleteSurveyResponseInputSchema } from "#shared/models/db/survey/DeleteSurveyResponseInput";
import { readSurveyResponseInputSchema } from "#shared/models/db/survey/ReadSurveyResponseInput";
import { updateSurveyResponseInputSchema } from "#shared/models/db/survey/UpdateSurveyResponseInput";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { transformPublishedBlobUrls } from "@@/server/services/resource/transformPublishedBlobUrls";
import { getInvalidParticipantTokenError } from "@@/server/services/survey/getInvalidParticipantTokenError";
import { readSurveyResponseRecords } from "@@/server/services/survey/readSurveyResponseRecords";
import { readSurveyResponsesCount } from "@@/server/services/survey/readSurveyResponsesCount";
import { requireSurveyResponse } from "@@/server/services/survey/requireSurveyResponse";
import { resolveSurveyResponseRead } from "@@/server/services/survey/resolveSurveyResponseRead";
import { resolveSurveyResponseWrite } from "@@/server/services/survey/resolveSurveyResponseWrite";
import { router } from "@@/server/trpc";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { createResourceProcedures } from "@@/server/trpc/procedure/resource/createResourceProcedures";
import { getOwnerProcedure } from "@@/server/trpc/procedure/resource/getOwnerProcedure";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";
import { createEntity, getEntity, updateEntity } from "@esposter/db";
import { AzureEntityType, AzureTable, ResourceType, SurveyResponseEntity } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

export const surveyRouter = router({
  // Survey uploads come from the shared fileAssets capability rather than a bespoke set here —
  // See ResourceDefinitionMap
  ...createResourceProcedures(ResourceType.Survey, {
    transformPublishedContent: transformPublishedBlobUrls,
  }),
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
      await requireSurveyResponse(surveyResponseClient, ctx.resource.id, rowKey);
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
      else if (resolvedParticipantToken && resolvedParticipantToken !== surveyResponse.participantToken)
        return undefined;
      else return surveyResponse;
    }),
  // The dataset contract carries no keys, so the blade reads rows keyed through its own procedure —
  // A blade-local read concern, not a Dataset shape change
  readSurveyResponseRecords: getOwnerProcedure(
    ResourceType.Survey,
    resourceIdInputSchema,
    "id",
  ).query<SurveyResponseRecords>(({ ctx }) => readSurveyResponseRecords(ctx.resource.id)),
  readSurveyResponsesCount: getOwnerProcedure(
    ResourceType.Survey,
    resourceIdInputSchema,
    "id",
  ).query<ReadSurveyResponsesCountResult>(({ ctx }) => readSurveyResponsesCount(ctx.resource.id)),
  updateSurveyResponse: standardRateLimitedProcedure
    .input(updateSurveyResponseInputSchema)
    .mutation<SurveyResponseEntity>(async ({ ctx, input }) => {
      const participantToken = await resolveSurveyResponseWrite(ctx.db, input.partitionKey, input.participantToken);
      const surveyResponseClient = await useTableClient(AzureTable.SurveyResponses);
      const surveyResponse = await requireSurveyResponse(surveyResponseClient, input.partitionKey, input.rowKey);
      // A resume must carry the identity it started with, so swapping tokens mid-response is a forgery.
      // Only Identified mode resolves a token to compare — Anonymous carries no identity to contradict
      if (participantToken && participantToken !== surveyResponse.participantToken)
        throw getInvalidParticipantTokenError();
      // Response models are plain records, so duplicates are detected structurally rather than by reference.
      // A page-only write persists only when it advances the resume position — identical answers on the same
      // Or an earlier page is a no-op (and must not regress a stored later page)
      if (JSON.stringify(input.model) === JSON.stringify(surveyResponse.model) && input.pageNo <= surveyResponse.pageNo)
        throw getInvalidOperationError(Operation.Update, AzureEntityType.SurveyResponse, "duplicate model");

      const modelVersion = input.modelVersion + 1;
      if (modelVersion <= surveyResponse.modelVersion)
        throw getInvalidOperationError(
          Operation.Update,
          AzureEntityType.SurveyResponse,
          "cannot update survey response model with old model version",
        );
      // The resolved token is written, never the caller's — a stale token cannot ride an Anonymous write.
      // An empty resolution keeps the identity the response was created with, so a live switch to
      // Anonymous never erases who answered from the program funnel
      const updatedSurveyResponse = {
        ...input,
        modelVersion,
        participantToken: participantToken || surveyResponse.participantToken,
      };
      await updateEntity(surveyResponseClient, updatedSurveyResponse);
      return Object.assign(surveyResponse, updatedSurveyResponse);
    }),
});
