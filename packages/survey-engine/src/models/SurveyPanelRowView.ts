import type { SurveyTemplateNode } from "#src/models/SurveyTemplateNode";

// A template question as one row of a dynamic panel shows it: the question the row shows, and whether the row enables it and requires it
export interface SurveyPanelRowView {
  isEnabled: boolean;
  isRequired: boolean;
  node: SurveyTemplateNode;
}
