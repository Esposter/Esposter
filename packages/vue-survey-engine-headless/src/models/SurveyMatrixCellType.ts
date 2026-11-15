// The kinds of cell a matrix column holds, each answered with the question kind the cell is drawn as
export const SurveyMatrixCellType = {
  Boolean: "boolean",
  Checkbox: "checkbox",
  Comment: "comment",
  Dropdown: "dropdown",
  Rating: "rating",
  Text: "text",
} as const;
export type SurveyMatrixCellType = (typeof SurveyMatrixCellType)[keyof typeof SurveyMatrixCellType];
