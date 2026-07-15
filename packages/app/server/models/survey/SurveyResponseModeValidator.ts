import type { Context } from "@@/server/trpc/context";
import type { Resource, SurveyResponseEntity } from "@esposter/db-schema";

// Returns the token to store on the response entity, or throws when the mode rejects the write.
// Adding a mode is one enum value plus one of these — that is the whole extensibility mechanism
export type SurveyResponseModeValidator = (
  db: Context["db"],
  surveyId: Resource["id"],
  inviteToken: SurveyResponseEntity["inviteToken"],
) => Promise<SurveyResponseEntity["inviteToken"]>;
