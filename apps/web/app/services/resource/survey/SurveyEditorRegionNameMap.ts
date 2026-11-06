import { SurveyEditorRegion } from "@/models/resource/survey/SurveyEditorRegion";

// The name each region is announced by: its landmark's label, or the title of its sheet on a compact window
export const SurveyEditorRegionNameMap = {
  [SurveyEditorRegion.Bar]: "Survey bar",
  [SurveyEditorRegion.Inspector]: "Inspector",
  [SurveyEditorRegion.Structure]: "Structure",
} as const satisfies Record<SurveyEditorRegion, string>;
