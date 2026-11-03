import type { SurveyTagBoxNode } from "#src/models/SurveyTagBoxNode";
import type { z } from "zod";

import { createSurveySelectionAnswerSchema } from "#src/services/runner/answer/createSurveySelectionAnswerSchema";

// A tag box's answer: a list of its choices, or of the text of its other answer, within the most its owner allows
export const createSurveyTagBoxAnswerSchema = (node: SurveyTagBoxNode): z.ZodType =>
  createSurveySelectionAnswerSchema({
    choices: node.props.choices,
    hasOther: node.props.hasOther,
    maxSelected: node.props.maxSelected,
  });
