import type { SurveyButtonGroupNode } from "#src/models/SurveyButtonGroupNode";
import type { z } from "zod";

import { createSurveyChoiceValueSchema } from "#src/services/runner/answer/createSurveyChoiceValueSchema";

// A button group's answer: one of its choices
export const createSurveyButtonGroupAnswerSchema = (node: SurveyButtonGroupNode): z.ZodType =>
  createSurveyChoiceValueSchema({ choices: node.props.choices });
