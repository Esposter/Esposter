import type { SurveyImagePickerNode } from "#src/models/SurveyImagePickerNode";
import type { z } from "zod";

import { createSurveyChoiceValueSchema } from "#src/services/runner/answer/createSurveyChoiceValueSchema";
import { createSurveySelectionAnswerSchema } from "#src/services/runner/answer/createSurveySelectionAnswerSchema";

// An image picker's answer: one of its choices, or a list of them when it takes several
export const createSurveyImagePickerAnswerSchema = (node: SurveyImagePickerNode): z.ZodType =>
  node.props.multiSelect
    ? createSurveySelectionAnswerSchema({ choices: node.props.choices })
    : createSurveyChoiceValueSchema({ choices: node.props.choices });
