import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { transformPublishedSurvey } from "@@/server/services/survey/transformPublishedSurvey";
import { transformReadSurvey } from "@@/server/services/survey/transformReadSurvey";
import { router } from "@@/server/trpc";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { createResourceProcedures } from "@@/server/trpc/procedure/resource/createResourceProcedures";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";
import { createEntity, getEntity, updateEntity } from "@esposter/db";
import {
  AzureEntityType,
  AzureTable,
  ResourceType,
  SurveyResponseEntity,
  surveyResponseEntitySchema,
} from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

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

      await updateEntity(surveyResponseClient, input);
      return Object.assign(surveyResponse, input);
    }),
});
