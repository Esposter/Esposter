import type { SurveyMatrixColumn } from "#src/models/SurveyMatrixColumn";
import type { z } from "zod";

import { SurveyMatrixCellType } from "#src/models/SurveyMatrixCellType";
import { createSurveyBooleanAnswerSchema } from "#src/services/runner/answer/createSurveyBooleanAnswerSchema";
import { createSurveyChoiceValueSchema } from "#src/services/runner/answer/createSurveyChoiceValueSchema";
import { createSurveyRatingValueSchema } from "#src/services/runner/answer/createSurveyRatingValueSchema";
import { createSurveySelectionAnswerSchema } from "#src/services/runner/answer/createSurveySelectionAnswerSchema";
import { createSurveyStringAnswerSchema } from "#src/services/runner/answer/createSurveyStringAnswerSchema";
import { MATRIX_CELL_RATING_COUNT } from "#src/services/runner/constants";
import { exhaustiveGuard } from "@esposter/shared";

// One cell of a dynamic matrix, checked by the kind of cell its column draws
export const createSurveyMatrixCellAnswerSchema = (column: SurveyMatrixColumn): z.ZodType => {
  switch (column.cellType) {
    case SurveyMatrixCellType.Boolean:
      return createSurveyBooleanAnswerSchema();
    case SurveyMatrixCellType.Checkbox:
      return createSurveySelectionAnswerSchema({ choices: column.choices });
    case SurveyMatrixCellType.Comment:
    case SurveyMatrixCellType.Text:
      return createSurveyStringAnswerSchema({});
    case SurveyMatrixCellType.Dropdown:
      return createSurveyChoiceValueSchema({ choices: column.choices });
    case SurveyMatrixCellType.Rating:
      return createSurveyRatingValueSchema(MATRIX_CELL_RATING_COUNT);
    default:
      return exhaustiveGuard(column.cellType);
  }
};
