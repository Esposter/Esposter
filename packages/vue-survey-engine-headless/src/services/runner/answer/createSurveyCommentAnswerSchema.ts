import type { SurveyCommentNode } from "#src/models/SurveyCommentNode";
import type { z } from "zod";

import { createSurveyStringAnswerSchema } from "#src/services/runner/answer/createSurveyStringAnswerSchema";

// A comment's answer: a string held to the length its question bounds it to
export const createSurveyCommentAnswerSchema = (node: SurveyCommentNode): z.ZodType =>
  createSurveyStringAnswerSchema({ maxLength: node.props.maxLength });
