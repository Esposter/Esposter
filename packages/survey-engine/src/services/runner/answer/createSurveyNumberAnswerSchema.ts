import { SURVEY_INVALID_ANSWER_MESSAGE, SURVEY_OUT_OF_RANGE_MESSAGE } from "#src/services/runner/constants";
import { z } from "zod";

// A number inside the bounds it is given, a side with no bound left open
export const createSurveyNumberAnswerSchema = ({ max, min }: { max?: number; min?: number }): z.ZodNumber => {
  const bounded = z.number({ error: SURVEY_INVALID_ANSWER_MESSAGE });
  const minBounded = min === undefined ? bounded : bounded.min(min, { error: SURVEY_OUT_OF_RANGE_MESSAGE });
  return max === undefined ? minBounded : minBounded.max(max, { error: SURVEY_OUT_OF_RANGE_MESSAGE });
};
