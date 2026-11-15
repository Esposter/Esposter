import type { EditorRegistry } from "#src/models/editor/EditorRegistry";

import ResourceSurveyCreatorCalculatedValues from "#src/components/Resource/Survey/Creator/CalculatedValues.vue";
import ResourceSurveyCreatorLayers from "#src/components/Resource/Survey/Creator/Layers.vue";
import ResourceSurveyCreatorLogicBuilder from "#src/components/Resource/Survey/Creator/LogicBuilder.vue";
import ResourceSurveyCreatorPalette from "#src/components/Resource/Survey/Creator/Palette.vue";
import ResourceSurveyCreatorProperties from "#src/components/Resource/Survey/Creator/Properties.vue";
import ResourceSurveyCreatorTheme from "#src/components/Resource/Survey/Creator/Theme.vue";
import ResourceSurveyCreatorToolbar from "#src/components/Resource/Survey/Creator/Toolbar.vue";
import { SurveyEditorContent } from "#src/models/resource/survey/SurveyEditorContent";

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
