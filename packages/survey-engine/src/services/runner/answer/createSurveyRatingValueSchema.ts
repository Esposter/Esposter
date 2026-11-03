import { SURVEY_INVALID_ANSWER_MESSAGE, SURVEY_OUT_OF_RANGE_MESSAGE } from "#src/services/runner/constants";
import { z } from "zod";

// The first step of every rating scale, so a rating is never below the lowest one a respondent can pick
const MIN_SURVEY_RATING = 1;

// A whole rating from the first step of its scale to the last
export const createSurveyRatingValueSchema = (rateCount: number): z.ZodNumber =>
  z
    .int({ error: SURVEY_INVALID_ANSWER_MESSAGE })
    .min(MIN_SURVEY_RATING, { error: SURVEY_OUT_OF_RANGE_MESSAGE })
    .max(rateCount, { error: SURVEY_OUT_OF_RANGE_MESSAGE });
