import type { SurveyPanelDynamicNode } from "#src/models/SurveyPanelDynamicNode";
import type { SurveyTemplateNode } from "#src/models/SurveyTemplateNode";

import { createSurveyNamedAnswerSchema } from "#src/services/runner/answer/createSurveyNamedAnswerSchema";
import { SURVEY_INVALID_ANSWER_MESSAGE, SURVEY_WRONG_COUNT_MESSAGE } from "#src/services/runner/constants";
import { z } from "zod";

// A dynamic panel's answer: a list of panels within the bounds its owner set, each one answering the template's questions
// The template's questions are checked by the schema the caller passes in, since this module cannot import the function that imports it
export const createSurveyPanelDynamicAnswerSchema = (
  node: SurveyPanelDynamicNode,
  createTemplateAnswerSchema: (node: SurveyTemplateNode) => z.ZodType,
): z.ZodType => {
  const panel = createSurveyNamedAnswerSchema(
    node.props.template.map((question) => ({
      isRequired: "isRequired" in question.props && question.props.isRequired,
      name: question.props.name,
      schema: createTemplateAnswerSchema(question),
    })),
  );
  return z
    .array(panel, { error: SURVEY_INVALID_ANSWER_MESSAGE })
    .min(node.props.minPanelCount, { error: SURVEY_WRONG_COUNT_MESSAGE })
    .max(node.props.maxPanelCount, { error: SURVEY_WRONG_COUNT_MESSAGE });
};
