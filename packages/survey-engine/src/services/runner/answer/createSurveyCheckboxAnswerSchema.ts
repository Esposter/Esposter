import type { SurveyCheckboxNode } from "#src/models/SurveyCheckboxNode";
import type { z } from "zod";

import { createSurveySelectionAnswerSchema } from "#src/services/runner/answer/createSurveySelectionAnswerSchema";

// A checkbox's answer: a list of its choices, within the selection bounds its owner set
export const createSurveyCheckboxAnswerSchema = (node: SurveyCheckboxNode): z.ZodType =>
  createSurveySelectionAnswerSchema({
    choices: node.props.choices,
    hasNone: node.props.hasNone,
    hasOther: node.props.hasOther,
    maxSelected: node.props.maxSelected,
    minSelected: node.props.minSelected,
  });
