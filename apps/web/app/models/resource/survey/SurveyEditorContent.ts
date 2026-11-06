// The content each panel of the survey's editor draws, which the survey's registry maps to a component. Two panels can draw the
// Same component under different keys, since the survey's texts and a node's properties are one form drawn for each selection
export enum SurveyEditorContent {
  Add = "add",
  Bar = "bar",
  CalculatedValues = "calculatedValues",
  Conditions = "conditions",
  Outline = "outline",
  Properties = "properties",
  SurveyTexts = "surveyTexts",
  Theme = "theme",
}
