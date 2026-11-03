import type { SurveyMatrixDynamicNode } from "#src/models/SurveyMatrixDynamicNode";

import { createSurveyMatrixCellAnswerSchema } from "#src/services/runner/answer/createSurveyMatrixCellAnswerSchema";
import { createSurveyNamedAnswerSchema } from "#src/services/runner/answer/createSurveyNamedAnswerSchema";
import { SURVEY_INVALID_ANSWER_MESSAGE, SURVEY_WRONG_COUNT_MESSAGE } from "#src/services/runner/constants";
import { z } from "zod";

// A dynamic matrix's answer: a list of rows within the bounds its owner set, each row a record keyed by its columns
export const createSurveyMatrixDynamicAnswerSchema = (node: SurveyMatrixDynamicNode): z.ZodType => {
  const row = createSurveyNamedAnswerSchema(
    node.props.columns.map((column) => ({
      isRequired: column.isRequired,
      name: column.name,
      schema: createSurveyMatrixCellAnswerSchema(column),
    })),
  );
  return z
    .array(row, { error: SURVEY_INVALID_ANSWER_MESSAGE })
    .min(node.props.minRowCount, { error: SURVEY_WRONG_COUNT_MESSAGE })
    .max(node.props.maxRowCount, { error: SURVEY_WRONG_COUNT_MESSAGE });
};
