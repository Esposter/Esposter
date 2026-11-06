import { SURVEY_INVALID_ANSWER_MESSAGE } from "#src/services/runner/constants";
import { z } from "zod";

// A yes or no answer, which is a boolean and nothing more
export const createSurveyBooleanAnswerSchema = (): z.ZodBoolean => z.boolean({ error: SURVEY_INVALID_ANSWER_MESSAGE });
