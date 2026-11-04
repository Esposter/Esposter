import type { SurveyPanelDynamicNode } from "#src/models/SurveyPanelDynamicNode";
import type { SurveyTemplateNode } from "#src/models/SurveyTemplateNode";
import type { SurveyLogicContext } from "survey-logic";

import { createSurveyNamedAnswerSchema } from "#src/services/runner/answer/createSurveyNamedAnswerSchema";
import { SURVEY_INVALID_ANSWER_MESSAGE, SURVEY_WRONG_COUNT_MESSAGE } from "#src/services/runner/constants";
import { getSurveyPanelRowViews } from "#src/services/runner/getSurveyPanelRowViews";
import { surveyAnswerValueSchema } from "#src/services/runner/surveyAnswerValueSchema";
import { z } from "zod";

// A dynamic panel's answer: a list of panels within the bounds its owner set, each one answering the template's questions
// A template question a row hides or disables is skipped for that row: it is neither required nor checked, as a top-level one is not
// The row's own answers are the panel scope its condition reads, beside the survey's values
// The template's questions are checked by the schema the caller passes in, since this module cannot import the function that imports it
export const createSurveyPanelDynamicAnswerSchema = (
  node: SurveyPanelDynamicNode,
  createTemplateAnswerSchema: (node: SurveyTemplateNode) => z.ZodType,
  values: SurveyLogicContext["values"],
  now: Date,
): z.ZodType => {
  const templateFields = node.props.template.map((question) => ({
    name: question.props.name,
    schema: createTemplateAnswerSchema(question),
  }));
  // Each row's shape is held first, which types its answers for the scope above. Its keys are the template's names, so a key none declares is refused here
  const rowShapeSchema = z.strictObject(
    Object.fromEntries(templateFields.map(({ name }) => [name, surveyAnswerValueSchema.optional()])),
    { error: SURVEY_INVALID_ANSWER_MESSAGE },
  );
  return z
    .array(rowShapeSchema, { error: SURVEY_INVALID_ANSWER_MESSAGE })
    .min(node.props.minPanelCount, { error: SURVEY_WRONG_COUNT_MESSAGE })
    .max(node.props.maxPanelCount, { error: SURVEY_WRONG_COUNT_MESSAGE })
    .superRefine((rows, ctx) => {
      for (const [index, row] of rows.entries()) {
        const views = getSurveyPanelRowViews(node, row, values, now);
        const rowSchema = createSurveyNamedAnswerSchema(
          templateFields.map(({ name, schema }) => {
            const view = views.find((item) => item.node.props.name === name);
            return view?.isEnabled
              ? { isRequired: view.isRequired, name, schema }
              : { isRequired: false, name, schema: z.unknown() };
          }),
        );
        const result = rowSchema.safeParse(row);
        if (!result.success)
          for (const issue of result.error.issues)
            ctx.addIssue({ code: "custom", message: issue.message, path: [index, ...issue.path] });
      }
    });
};
