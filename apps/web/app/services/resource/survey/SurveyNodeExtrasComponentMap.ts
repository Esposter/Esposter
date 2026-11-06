import type { SurveyNodeExtraEditor } from "@/models/resource/survey/SurveyNodeExtraEditor";

import ResourceSurveyCreatorChoiceListEditor from "@/components/Resource/Survey/Creator/ChoiceListEditor.vue";
import ResourceSurveyCreatorMatrixColumnsEditor from "@/components/Resource/Survey/Creator/MatrixColumnsEditor.vue";
import ResourceSurveyCreatorMultipleTextItemsEditor from "@/components/Resource/Survey/Creator/MultipleTextItemsEditor.vue";
import { SurveyNodeType } from "vue-survey-engine-headless";

// The editors a kind's settings take beside its form, each for a list the form leaves out and the editor draws under the
// Props key it is held at. The image kinds' editors are not lists, so they are in SurveyImageExtras
const choicesEditor: SurveyNodeExtraEditor = {
  component: ResourceSurveyCreatorChoiceListEditor,
  key: "choices",
  label: "Choices",
};
export const SurveyNodeExtrasComponentMap: Partial<Record<SurveyNodeType, SurveyNodeExtraEditor[]>> = {
  [SurveyNodeType.ButtonGroup]: [choicesEditor],
  [SurveyNodeType.Checkbox]: [choicesEditor],
  [SurveyNodeType.Dropdown]: [choicesEditor],
  [SurveyNodeType.Matrix]: [
    { component: ResourceSurveyCreatorChoiceListEditor, key: "rows", label: "Rows" },
    { component: ResourceSurveyCreatorChoiceListEditor, key: "columns", label: "Columns" },
  ],
  [SurveyNodeType.MatrixDynamic]: [
    { component: ResourceSurveyCreatorMatrixColumnsEditor, key: "columns", label: "Columns" },
  ],
  [SurveyNodeType.MultipleText]: [
    { component: ResourceSurveyCreatorMultipleTextItemsEditor, key: "items", label: "Items" },
  ],
  [SurveyNodeType.RadioGroup]: [choicesEditor],
  [SurveyNodeType.Ranking]: [choicesEditor],
  [SurveyNodeType.TagBox]: [choicesEditor],
};
