import { RESPONDENT_PROCEDURE_REASON } from "#server/services/survey/constants";
import { standardRateLimitedProcedure } from "#server/trpc/procedure/standardRateLimitedProcedure";

// A respondent's procedure answers for the person filling the survey in, never for the owner acting on it
export const standardRespondentProcedure = standardRateLimitedProcedure.meta({
  humanOnly: RESPONDENT_PROCEDURE_REASON,
});
