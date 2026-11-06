import type { SurveyDropdownNode } from "#src/models/SurveyDropdownNode";
import type { z } from "zod";

import { createSurveyChoiceValueSchema } from "#src/services/runner/answer/createSurveyChoiceValueSchema";

// A dropdown's answer: one of its choices, or the text of its other answer when it has one
export const createSurveyDropdownAnswerSchema = (node: SurveyDropdownNode): z.ZodType =>
  createSurveyChoiceValueSchema({ choices: node.props.choices, hasOther: node.props.hasOther });
