import type { z } from "zod";

import { createSurveyStringAnswerSchema } from "#src/services/runner/answer/createSurveyStringAnswerSchema";
import { SURVEY_OUT_OF_RANGE_MESSAGE, SURVEY_REQUIRED_MESSAGE } from "#src/services/runner/constants";

// A date, time or local date and time answer: a non-empty string within the bounds its question gives
// Its values sort as text in the order they happen in, so the bounds compare as text
export const createSurveyStringRangeAnswerSchema = ({ max, min }: { max: string; min: string }): z.ZodString =>
  createSurveyStringAnswerSchema({})
    .min(1, { error: SURVEY_REQUIRED_MESSAGE })
    .refine((value) => min === "" || value >= min, { error: SURVEY_OUT_OF_RANGE_MESSAGE })
    .refine((value) => max === "" || value <= max, { error: SURVEY_OUT_OF_RANGE_MESSAGE });
