import type { EditorRegistry } from "@/models/editor/EditorRegistry";

import ResourceSurveyCreatorCalculatedValues from "@/components/Resource/Survey/Creator/CalculatedValues.vue";
import ResourceSurveyCreatorLayers from "@/components/Resource/Survey/Creator/Layers.vue";
import ResourceSurveyCreatorLogicBuilder from "@/components/Resource/Survey/Creator/LogicBuilder.vue";
import ResourceSurveyCreatorPalette from "@/components/Resource/Survey/Creator/Palette.vue";
import ResourceSurveyCreatorProperties from "@/components/Resource/Survey/Creator/Properties.vue";
import ResourceSurveyCreatorTheme from "@/components/Resource/Survey/Creator/Theme.vue";
import ResourceSurveyCreatorToolbar from "@/components/Resource/Survey/Creator/Toolbar.vue";
import { SurveyEditorContent } from "@/models/resource/survey/SurveyEditorContent";

// The component each content key of the survey's layout draws. The layout check reports a key with no entry here
export const SurveyEditorRegistry: EditorRegistry = {
  [SurveyEditorContent.Add]: ResourceSurveyCreatorPalette,
  [SurveyEditorContent.Bar]: ResourceSurveyCreatorToolbar,
  [SurveyEditorContent.CalculatedValues]: ResourceSurveyCreatorCalculatedValues,
  [SurveyEditorContent.Conditions]: ResourceSurveyCreatorLogicBuilder,
  [SurveyEditorContent.Outline]: ResourceSurveyCreatorLayers,
  [SurveyEditorContent.Properties]: ResourceSurveyCreatorProperties,
  [SurveyEditorContent.SurveyTexts]: ResourceSurveyCreatorProperties,
  [SurveyEditorContent.Theme]: ResourceSurveyCreatorTheme,
};
