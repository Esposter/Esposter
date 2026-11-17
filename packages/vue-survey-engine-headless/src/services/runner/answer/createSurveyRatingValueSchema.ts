import { SURVEY_INVALID_ANSWER_MESSAGE, SURVEY_OUT_OF_RANGE_MESSAGE } from "#src/services/runner/constants";
import { z } from "zod";

// A whole rating from the scale's first step to its last, the scale being rateCount steps counted up from rateMin
export const createSurveyRatingValueSchema = (rateMin: number, rateCount: number): z.ZodNumber =>
  z
    .int({ error: SURVEY_INVALID_ANSWER_MESSAGE })
    .min(rateMin, { error: SURVEY_OUT_OF_RANGE_MESSAGE })
    .max(rateMin + rateCount - 1, { error: SURVEY_OUT_OF_RANGE_MESSAGE });
