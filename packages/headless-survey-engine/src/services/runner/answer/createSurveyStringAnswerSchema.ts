import { MAX_SURVEY_ANSWER_LENGTH } from "#src/services/constants";
import {
  SURVEY_INVALID_ANSWER_MESSAGE,
  SURVEY_TOO_LONG_MESSAGE,
  SURVEY_TOO_SHORT_MESSAGE,
} from "#src/services/runner/constants";
import { z } from "zod";

// A string no longer than the answer length limit, and within the lengths its question bounds it to
export const createSurveyStringAnswerSchema = ({
  maxLength,
  minLength,
}: {
  maxLength?: number;
  minLength?: number;
}): z.ZodString => {
  const bounded = z
    .string({ error: SURVEY_INVALID_ANSWER_MESSAGE })
    .max(MAX_SURVEY_ANSWER_LENGTH, { error: SURVEY_TOO_LONG_MESSAGE });
  const minBounded = minLength === undefined ? bounded : bounded.min(minLength, { error: SURVEY_TOO_SHORT_MESSAGE });
  return maxLength === undefined ? minBounded : minBounded.max(maxLength, { error: SURVEY_TOO_LONG_MESSAGE });
};
