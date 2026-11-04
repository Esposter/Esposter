import type { SurveyMatrixNode } from "#src/models/SurveyMatrixNode";
import type { z } from "zod";

import { createSurveyChoiceValueSchema } from "#src/services/runner/answer/createSurveyChoiceValueSchema";
import { createSurveyNamedAnswerSchema } from "#src/services/runner/answer/createSurveyNamedAnswerSchema";

// A matrix's answer: a record from each row's value to the value of the column picked for it
// When every row is required, each row must be answered
export const createSurveyMatrixAnswerSchema = (node: SurveyMatrixNode): z.ZodType => {
  const column = createSurveyChoiceValueSchema({ choices: node.props.columns });
  return createSurveyNamedAnswerSchema(
    node.props.rows.map((row) => ({ isRequired: node.props.isAllRowRequired, name: `${row.value}`, schema: column })),
  );
};
