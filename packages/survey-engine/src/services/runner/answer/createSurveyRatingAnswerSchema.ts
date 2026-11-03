import type { SurveyRatingNode } from "#src/models/SurveyRatingNode";
import type { z } from "zod";

import { createSurveyRatingValueSchema } from "#src/services/runner/answer/createSurveyRatingValueSchema";

// A rating's answer: a whole step of the scale its owner set
export const createSurveyRatingAnswerSchema = (node: SurveyRatingNode): z.ZodType =>
  createSurveyRatingValueSchema(node.props.rateCount);
