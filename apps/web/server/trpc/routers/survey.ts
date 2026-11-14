import type { ReadSurveyResponsesCountResult } from "#shared/models/resource/survey/ReadSurveyResponsesCountResult";
import type { SurveyResponseRecords } from "#shared/models/resource/survey/SurveyResponseRecords";
import { getInvalidParticipantTokenError } from "#server/services/survey/getInvalidParticipantTokenError";
import { readSurveyResponseRecords } from "#server/services/survey/readSurveyResponseRecords";
import { readSurveyResponsesCount } from "#server/services/survey/readSurveyResponsesCount";
import { resolveSurveyResponseRead } from "#server/services/survey/resolveSurveyResponseRead";
import { resolveSurveyResponseWrite } from "#server/services/survey/resolveSurveyResponseWrite";
import { router } from "#server/trpc";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { createResourceProcedures } from "#server/trpc/procedure/resource/createResourceProcedures";
import { getOwnerProcedure } from "#server/trpc/procedure/resource/getOwnerProcedure";
import { slowRateLimitedProcedure } from "#server/trpc/procedure/slowRateLimitedProcedure";
import { standardRateLimitedProcedure } from "#server/trpc/procedure/standardRateLimitedProcedure";
import { DatabaseEntityType, McpScope, ResourceType, surveyResponsesInResource } from "@esposter/db-schema";
import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { createSurveyResponseInputSchema } from "#shared/models/db/survey/CreateSurveyResponseInput";
import { deleteSurveyResponseInputSchema } from "#shared/models/db/survey/DeleteSurveyResponseInput";
import { readSurveyResponseInputSchema } from "#shared/models/db/survey/ReadSurveyResponseInput";
import { updateSurveyResponseInputSchema } from "#shared/models/db/survey/UpdateSurveyResponseInput";
import type { SurveyResponseInResource } from "@esposter/db-schema";
import { Operation, takeOne } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

// A respondent's procedures answer for the person filling the survey in, never for the owner acting on it
const RESPONDENT_PROCEDURE_REASON = "A respondent's procedure, not the owner's act";
const slowRespondentProcedure = slowRateLimitedProcedure.meta({ humanOnly: RESPONDENT_PROCEDURE_REASON });
const standardRespondentProcedure = standardRateLimitedProcedure.meta({ humanOnly: RESPONDENT_PROCEDURE_REASON });

export const surveyRouter = router({
  // Survey uploads come from the shared fileAssets capability rather than a bespoke set here —
  // See ResourceDefinitionMap
  ...createResourceProcedures(ResourceType.Survey),
  createSurveyResponse: slowRespondentProcedure
    .input(createSurveyResponseInputSchema)
    .mutation<SurveyResponseInResource>(async ({ ctx, input: { isDraft, participantToken, ...input } }) => {
      const participantTokenHash = await resolveSurveyResponseWrite(ctx.db, input.resourceId, participantToken, {
        isDraft,
        model: input.model,
      });
      return takeOne(
        await ctx.db
          .insert(surveyResponsesInResource)
          .values({ ...input, isDraft, participantTokenHash })
          .returning(),
      );
    }),
  deleteSurveyResponse: getOwnerProcedure(ResourceType.Survey, deleteSurveyResponseInputSchema, "id")
    .meta({ humanOnly: "Deletes a respondent's answer outright, data the owner holds on someone else's behalf" })
    .mutation<void>(async ({ ctx, input: { responseId } }) => {
      // Existence is proven before deleting so a second delete of the same response errors rather than silently passing
      await requireEntity(
        ctx.db.query.surveyResponsesInResource.findFirst({
          where: { id: { eq: responseId }, resourceId: { eq: ctx.resource.id } },
        }),
        DatabaseEntityType.SurveyResponse,
        responseId,
      );
      await ctx.db.delete(surveyResponsesInResource).where(eq(surveyResponsesInResource.id, responseId));
    }),
  readSurveyResponse: standardRespondentProcedure
    .input(readSurveyResponseInputSchema)
    .query<SurveyResponseInResource | undefined>(async ({ ctx, input: { id, participantToken, resourceId } }) => {
      const resolvedParticipantTokenHash = await resolveSurveyResponseRead(ctx.db, resourceId, participantToken);
      const surveyResponse = await ctx.db.query.surveyResponsesInResource.findFirst({
        where: { id: { eq: id }, resourceId: { eq: resourceId } },
      });
      if (!surveyResponse) return undefined;
      // A resume must present the identity the response was started with, so another participant's row is
      // Indistinguishable from one that does not exist. Only Identified mode resolves a token to compare —
      // Anonymous carries no identity to contradict, so a survey switched to it still resumes its
      // Identified-era responses, exactly as the write boundary treats them
      else if (resolvedParticipantTokenHash && resolvedParticipantTokenHash !== surveyResponse.participantTokenHash)
        return undefined;
      else return surveyResponse;
    }),
  // The dataset contract carries no keys, so the blade reads rows keyed through its own procedure —
  // A blade-local read concern, not a Dataset shape change
  readSurveyResponseRecords: getOwnerProcedure(ResourceType.Survey, resourceIdInputSchema, "id")
    .meta({
      mcp: {
        description:
          "Read a survey's responses, one record per respondent, as its owner reads them. Answers the records.",
        scope: McpScope.Resources,
      },
    })
    .query<SurveyResponseRecords>(({ ctx }) => readSurveyResponseRecords(ctx.db, ctx.resource.id)),
  readSurveyResponsesCount: getOwnerProcedure(ResourceType.Survey, resourceIdInputSchema, "id")
    .meta({
      mcp: { description: "Count the responses a survey has received. Answers the count.", scope: McpScope.Resources },
    })
    .query<ReadSurveyResponsesCountResult>(({ ctx }) => readSurveyResponsesCount(ctx.db, ctx.resource.id)),
  updateSurveyResponse: standardRespondentProcedure
    .input(updateSurveyResponseInputSchema)
    .mutation<SurveyResponseInResource>(async ({ ctx, input: { id, isDraft, resourceId, ...input } }) => {
      const participantTokenHash = await resolveSurveyResponseWrite(ctx.db, resourceId, input.participantToken, {
        isDraft,
        model: input.model,
      });
      const surveyResponse = await requireEntity(
        ctx.db.query.surveyResponsesInResource.findFirst({ where: { id: { eq: id }, resourceId: { eq: resourceId } } }),
        DatabaseEntityType.SurveyResponse,
        JSON.stringify({ id, resourceId }),
      );
      // A resume must carry the identity it started with, so swapping tokens mid-response is a forgery.
      // Only Identified mode resolves a token to compare — Anonymous carries no identity to contradict
      if (participantTokenHash && participantTokenHash !== surveyResponse.participantTokenHash)
        throw getInvalidParticipantTokenError();
      // A submitted response stays submitted, whatever a later save says
      const isUpdatedDraft = surveyResponse.isDraft && isDraft;
      // Response models are plain records, so duplicates are detected structurally rather than by reference.
      // A page-only write persists only when it advances the resume position — identical answers on the same
      // Or an earlier page are a no-op (and must not regress a stored later page) unless they submit the draft
      if (
        JSON.stringify(input.model) === JSON.stringify(surveyResponse.model) &&
        input.pageNo <= surveyResponse.pageNo &&
        isUpdatedDraft === surveyResponse.isDraft
      )
        throw getInvalidOperationError(Operation.Update, DatabaseEntityType.SurveyResponse, "duplicate model");

      const modelVersion = input.modelVersion + 1;
      if (modelVersion <= surveyResponse.modelVersion)
        throw getInvalidOperationError(
          Operation.Update,
          DatabaseEntityType.SurveyResponse,
          "cannot update survey response model with old model version",
        );
      // The write is conditional on the version it read, so a save a concurrent one overtook matches no row and is
      // refused here rather than written back over it. The resolved token is written, never the caller's — a stale
      // token cannot ride an Anonymous write, and an empty resolution keeps the identity the response was created with,
      // so a live switch to Anonymous never erases who answered from the program funnel
      const [updatedSurveyResponse] = await ctx.db
        .update(surveyResponsesInResource)
        .set({
          isDraft: isUpdatedDraft,
          model: input.model,
          modelVersion,
          pageNo: input.pageNo,
          participantTokenHash: participantTokenHash || surveyResponse.participantTokenHash,
        })
        .where(
          and(
            eq(surveyResponsesInResource.id, id),
            eq(surveyResponsesInResource.modelVersion, surveyResponse.modelVersion),
          ),
        )
        .returning();
      return requireMutation(
        updatedSurveyResponse,
        Operation.Update,
        DatabaseEntityType.SurveyResponse,
        "cannot update survey response model with old model version",
      );
    }),
});
