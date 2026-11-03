import type { SurveyMatrixColumn } from "#src/models/SurveyMatrixColumn";

import { SurveyMatrixCellType } from "#src/models/SurveyMatrixCellType";
import { createSurveyChoiceValueSchema } from "#src/services/runner/answer/createSurveyChoiceValueSchema";
import { createSurveyRatingValueSchema } from "#src/services/runner/answer/createSurveyRatingValueSchema";
import { createSurveySelectionAnswerSchema } from "#src/services/runner/answer/createSurveySelectionAnswerSchema";
import { createSurveyStringAnswerSchema } from "#src/services/runner/answer/createSurveyStringAnswerSchema";
import { SURVEY_INVALID_ANSWER_MESSAGE } from "#src/services/runner/constants";
import { exhaustiveGuard } from "@esposter/shared";
import { z } from "zod";

// A column sets no scale for its rating cells, so each one is held to a five-step scale
const MATRIX_CELL_RATING_COUNT = 5;

// One cell of a dynamic matrix, checked by the kind of cell its column draws
export const createSurveyMatrixCellAnswerSchema = (column: SurveyMatrixColumn): z.ZodType => {
  switch (column.cellType) {
    case SurveyMatrixCellType.Text:
    case SurveyMatrixCellType.Comment:
      return createSurveyStringAnswerSchema({});
    case SurveyMatrixCellType.Dropdown:
      return createSurveyChoiceValueSchema({ choices: column.choices });
    case SurveyMatrixCellType.Checkbox:
      return createSurveySelectionAnswerSchema({ choices: column.choices });
    case SurveyMatrixCellType.Boolean:
      return z.boolean({ error: SURVEY_INVALID_ANSWER_MESSAGE });
    case SurveyMatrixCellType.Rating:
      return createSurveyRatingValueSchema(MATRIX_CELL_RATING_COUNT);
    default:
      return exhaustiveGuard(column.cellType);
  }
};
