import type { SurveyMatrixColumn } from "survey-engine";

import { SurveyMatrixCellType } from "survey-engine";

// The column a typed title makes: a text column whose name and title are the title, trimmed. The name is what an answer
// is keyed by, so a name the schema refuses or another column repeats is refused once the column is added. Blank text
// makes no column
export const toSurveyMatrixColumnFromText = (text: string): SurveyMatrixColumn[] => {
  const title = text.trim();
  if (title === "") return [];

  return [{ cellType: SurveyMatrixCellType.Text, choices: [], isRequired: false, name: title, title }];
};
