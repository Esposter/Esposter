import type { SurveyMatrixColumn } from "survey-engine";

import { SurveyMatrixCellType } from "survey-engine";

// The column a typed title makes: a text column whose name and title are the title, trimmed
// A name is what an answer is keyed by, so a name the schema refuses, or one another column repeats, is refused on add
// Blank text makes no column
export const toSurveyMatrixColumnFromText = (text: string): SurveyMatrixColumn | undefined => {
  const title = text.trim();
  if (title === "") return undefined;

  return { cellType: SurveyMatrixCellType.Text, choices: [], isRequired: false, name: title, title };
};
