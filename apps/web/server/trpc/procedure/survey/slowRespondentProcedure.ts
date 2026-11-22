import { RESPONDENT_PROCEDURE_REASON } from "#server/services/survey/constants";
import { slowRateLimitedProcedure } from "#server/trpc/procedure/slowRateLimitedProcedure";

// A respondent's procedure answers for the person filling the survey in, never for the owner acting on it
export const slowRespondentProcedure = slowRateLimitedProcedure.meta({ humanOnly: RESPONDENT_PROCEDURE_REASON });
