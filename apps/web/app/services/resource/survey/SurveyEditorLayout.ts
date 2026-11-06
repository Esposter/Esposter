import type { Layout } from "vue-editor-layout-headless";

import { SurveyEditorContent } from "@/models/resource/survey/SurveyEditorContent";
import { SurveyEditorPanel } from "@/models/resource/survey/SurveyEditorPanel";
import { SurveyEditorRegion } from "@/models/resource/survey/SurveyEditorRegion";
import { SurveyEditorSelectionKind } from "@/models/resource/survey/SurveyEditorSelectionKind";
import { DEFAULT_SIDE_PANE_WIDTH } from "@/services/pageBuilder/constants";
import { SURVEY_BAR_HEIGHT, SURVEY_DESIGN_MODE } from "@/services/resource/survey/constants";
import { MAX_SIDE_PANE_WIDTH, MIN_SIDE_PANE_WIDTH } from "@/services/ui/constants";
import { RegionEdge, RegionOpening, RegionPresentation, SizeClass } from "vue-editor-layout-headless";

// The survey's editor as plain data: a bar across the top, the structure beside the canvas and the inspector beyond it. Preview
// Removes the structure and the inspector, so the runner has the width a respondent has. On a window below the mobile breakpoint
// The structure and the inspector are sheets, as the page's own drawers are there
export const SurveyEditorLayout: Layout = {
  canvasId: "canvas",
  panels: [
    {
      condition: { modes: [SURVEY_DESIGN_MODE] },
      id: SurveyEditorPanel.Outline,
      regionId: SurveyEditorRegion.Structure,
      selectionKindContentKeyMap: {},
      wildcardContentKey: SurveyEditorContent.Outline,
    },
    {
      condition: { modes: [SURVEY_DESIGN_MODE] },
      id: SurveyEditorPanel.Add,
      regionId: SurveyEditorRegion.Structure,
      selectionKindContentKeyMap: {},
      wildcardContentKey: SurveyEditorContent.Add,
    },
    {
      condition: { modes: [SURVEY_DESIGN_MODE] },
      id: SurveyEditorPanel.Survey,
      regionId: SurveyEditorRegion.Inspector,
      selectionKindContentKeyMap: { "": SurveyEditorContent.SurveyTexts },
      wildcardContentKey: "",
    },
    {
      condition: { modes: [SURVEY_DESIGN_MODE] },
      id: SurveyEditorPanel.Properties,
      regionId: SurveyEditorRegion.Inspector,
      selectionKindContentKeyMap: { [SurveyEditorSelectionKind.Node]: SurveyEditorContent.Properties },
      wildcardContentKey: "",
    },
    {
      condition: { modes: [SURVEY_DESIGN_MODE] },
      id: SurveyEditorPanel.Logic,
      regionId: SurveyEditorRegion.Inspector,
      selectionKindContentKeyMap: {
        "": SurveyEditorContent.CalculatedValues,
        [SurveyEditorSelectionKind.Node]: SurveyEditorContent.Conditions,
      },
      wildcardContentKey: "",
    },
    {
      condition: { modes: [SURVEY_DESIGN_MODE] },
      id: SurveyEditorPanel.Theme,
      regionId: SurveyEditorRegion.Inspector,
      selectionKindContentKeyMap: { "": SurveyEditorContent.Theme },
      wildcardContentKey: "",
    },
    {
      condition: {},
      id: SurveyEditorPanel.Bar,
      regionId: SurveyEditorRegion.Bar,
      selectionKindContentKeyMap: {},
      wildcardContentKey: SurveyEditorContent.Bar,
    },
  ],
  regions: [
    {
      defaultSize: SURVEY_BAR_HEIGHT,
      edge: RegionEdge.Top,
      id: SurveyEditorRegion.Bar,
      maximumSize: SURVEY_BAR_HEIGHT,
      minimumSize: SURVEY_BAR_HEIGHT,
      opening: RegionOpening.WithContent,
      sizeClassEdgeMap: {},
      sizeClassPresentationMap: {
        [SizeClass.Compact]: RegionPresentation.Docked,
        [SizeClass.Expanded]: RegionPresentation.Docked,
        [SizeClass.Medium]: RegionPresentation.Docked,
      },
    },
    {
      defaultSize: DEFAULT_SIDE_PANE_WIDTH,
      edge: RegionEdge.Start,
      id: SurveyEditorRegion.Structure,
      maximumSize: MAX_SIDE_PANE_WIDTH,
      minimumSize: MIN_SIDE_PANE_WIDTH,
      opening: RegionOpening.OnDemand,
      sizeClassEdgeMap: {},
      sizeClassPresentationMap: {
        [SizeClass.Compact]: RegionPresentation.Sheet,
        [SizeClass.Expanded]: RegionPresentation.Docked,
        [SizeClass.Medium]: RegionPresentation.Sheet,
      },
    },
    {
      defaultSize: DEFAULT_SIDE_PANE_WIDTH,
      edge: RegionEdge.End,
      id: SurveyEditorRegion.Inspector,
      maximumSize: MAX_SIDE_PANE_WIDTH,
      minimumSize: MIN_SIDE_PANE_WIDTH,
      opening: RegionOpening.WithContent,
      sizeClassEdgeMap: {},
      sizeClassPresentationMap: {
        [SizeClass.Compact]: RegionPresentation.Sheet,
        [SizeClass.Expanded]: RegionPresentation.Docked,
        [SizeClass.Medium]: RegionPresentation.Sheet,
      },
    },
  ],
};
