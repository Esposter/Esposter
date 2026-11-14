import type { Context } from "#server/trpc/context";
import type { ResourceInResource, SurveyResponseInResource } from "@esposter/db-schema";

// Takes the participant token a respondent presented and returns the hash to store on the response, or throws when the
// mode rejects the write. Adding a mode is one enum value plus one of these — that is the whole extensibility mechanism
export type SurveyResponseModeValidator = (
  db: Context["db"],
  surveyId: ResourceInResource["id"],
  participantToken: string,
) => Promise<SurveyResponseInResource["participantTokenHash"]>;
