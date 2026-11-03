import type { SurveyMatrixColumn } from "survey-engine";

import { normalizeString } from "@esposter/shared";
import { SurveyMatrixCellType } from "survey-engine";

// The column a typed title makes, its trimmed text both its name and its title, with a text cell and no choices
export const buildSurveyMatrixColumn = (text: string): SurveyMatrixColumn => {
  const trimmedText = normalizeString(text);
  return { cellType: SurveyMatrixCellType.Text, choices: [], isRequired: false, name: trimmedText, title: trimmedText };
};
