import type { SurveyAnswerValue } from "#src/models/SurveyAnswerValue";
import type { SurveyPanelDynamicNode } from "#src/models/SurveyPanelDynamicNode";
import type { SurveyTemplateNode } from "#src/models/SurveyTemplateNode";
import type { SurveyLogicContext, SurveyLogicRecord } from "survey-logic";

import { createSurveyNamedAnswerSchema } from "#src/services/runner/answer/createSurveyNamedAnswerSchema";
import { checkSurveyNodeVisible } from "#src/services/runner/checkSurveyNodeVisible";
import { SURVEY_INVALID_ANSWER_MESSAGE, SURVEY_WRONG_COUNT_MESSAGE } from "#src/services/runner/constants";
import { surveyAnswerValueSchema } from "#src/services/runner/surveyAnswerValueSchema";
import { toSurveyLogicValue } from "#src/services/runner/toSurveyLogicValue";
import { z } from "zod";

// A row's answers as the panel scope a template question's condition reads, a name the row leaves out reading as absent
const toSurveyPanelScope = (row: Record<string, SurveyAnswerValue | undefined>): SurveyLogicRecord => {
  const scope: SurveyLogicRecord = {};
  for (const [name, answer] of Object.entries(row)) if (answer !== undefined) scope[name] = toSurveyLogicValue(answer);
  return scope;
};

// A dynamic panel's answer: a list of panels within the bounds its owner set, each one answering the template's questions
// A template question hidden in a row is skipped for that row: it is neither required nor checked
// The row's own answers are the panel scope its condition reads, beside the survey's values
// The template's questions are checked by the schema the caller passes in, since this module cannot import the function that imports it
export const createSurveyPanelDynamicAnswerSchema = (
  node: SurveyPanelDynamicNode,
  createTemplateAnswerSchema: (node: SurveyTemplateNode) => z.ZodType,
  values: SurveyLogicContext["values"],
  now: Date,
): z.ZodType => {
  const templateFields = node.props.template.map((question) => ({
    isRequired: "isRequired" in question.props && question.props.isRequired,
    name: question.props.name,
    question,
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
        const scope = toSurveyPanelScope(row);
        const rowSchema = createSurveyNamedAnswerSchema(
          templateFields.map(({ isRequired, name, question, schema }) =>
            checkSurveyNodeVisible(question, values, now, { panel: scope })
              ? { isRequired, name, schema }
              : { isRequired: false, name, schema: z.unknown() },
          ),
        );
        const result = rowSchema.safeParse(row);
        if (!result.success)
          for (const issue of result.error.issues)
            ctx.addIssue({ code: "custom", message: issue.message, path: [index, ...issue.path] });
      }
    });
};
