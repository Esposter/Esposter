import { SurveyEditorPanel } from "@/models/resource/survey/SurveyEditorPanel";

// The title each panel's tab is drawn with. The bar's panel is never a tab, so its title is only the one its region names
export const SurveyEditorPanelNameMap = {
  [SurveyEditorPanel.Add]: "Add",
  [SurveyEditorPanel.Bar]: "Survey bar",
  [SurveyEditorPanel.Logic]: "Logic",
  [SurveyEditorPanel.Outline]: "Outline",
  [SurveyEditorPanel.Properties]: "Properties",
  [SurveyEditorPanel.Survey]: "Survey",
  [SurveyEditorPanel.Theme]: "Theme",
} as const satisfies Record<SurveyEditorPanel, string>;
