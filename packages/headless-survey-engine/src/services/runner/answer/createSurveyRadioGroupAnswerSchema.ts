import type { SurveyRadioGroupNode } from "#src/models/SurveyRadioGroupNode";
import type { z } from "zod";

import { createSurveyChoiceValueSchema } from "#src/services/runner/answer/createSurveyChoiceValueSchema";

// A radio group's answer: one of its choices, or its none or other answer when it has one
export const createSurveyRadioGroupAnswerSchema = (node: SurveyRadioGroupNode): z.ZodType =>
  createSurveyChoiceValueSchema({
    choices: node.props.choices,
    hasNone: node.props.hasNone,
    hasOther: node.props.hasOther,
  });
