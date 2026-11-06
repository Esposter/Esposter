import type { z } from "zod";

// The message of the first issue a refused answer carries, which is the one a respondent is shown
export const getSurveyFirstMessage = (result: z.ZodSafeParseResult<unknown>): string | undefined =>
  result.error?.issues[0]?.message;
