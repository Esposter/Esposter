import type { SurveyQuestionNode } from "survey-engine";

import { SurveyNodeType } from "survey-engine";

// The field each question kind is drawn with, loaded on demand: a survey page downloads only the fields its questions
// Draw, as the resource's editor and view maps do for their components
export const SurveyFieldComponentMap: Record<SurveyQuestionNode["type"], Component> = {
  [SurveyNodeType.Boolean]: defineAsyncComponent(() => import("@/components/Resource/Survey/Field/Boolean.vue")),
  [SurveyNodeType.ButtonGroup]: defineAsyncComponent(
    () => import("@/components/Resource/Survey/Field/ButtonGroup.vue"),
  ),
  [SurveyNodeType.Checkbox]: defineAsyncComponent(() => import("@/components/Resource/Survey/Field/Checkbox.vue")),
  [SurveyNodeType.Comment]: defineAsyncComponent(() => import("@/components/Resource/Survey/Field/Comment.vue")),
  [SurveyNodeType.Dropdown]: defineAsyncComponent(() => import("@/components/Resource/Survey/Field/Dropdown.vue")),
  [SurveyNodeType.Expression]: defineAsyncComponent(() => import("@/components/Resource/Survey/Field/Expression.vue")),
  [SurveyNodeType.Html]: defineAsyncComponent(() => import("@/components/Resource/Survey/Field/Html.vue")),
  [SurveyNodeType.Image]: defineAsyncComponent(() => import("@/components/Resource/Survey/Field/Image.vue")),
  [SurveyNodeType.ImagePicker]: defineAsyncComponent(
    () => import("@/components/Resource/Survey/Field/ImagePicker.vue"),
  ),
  [SurveyNodeType.Matrix]: defineAsyncComponent(() => import("@/components/Resource/Survey/Field/Matrix.vue")),
  [SurveyNodeType.MatrixDynamic]: defineAsyncComponent(
    () => import("@/components/Resource/Survey/Field/MatrixDynamic.vue"),
  ),
  [SurveyNodeType.MultipleText]: defineAsyncComponent(
    () => import("@/components/Resource/Survey/Field/MultipleText.vue"),
  ),
  [SurveyNodeType.PanelDynamic]: defineAsyncComponent(
    () => import("@/components/Resource/Survey/Field/PanelDynamic.vue"),
  ),
  [SurveyNodeType.RadioGroup]: defineAsyncComponent(() => import("@/components/Resource/Survey/Field/RadioGroup.vue")),
  [SurveyNodeType.Ranking]: defineAsyncComponent(() => import("@/components/Resource/Survey/Field/Ranking.vue")),
  [SurveyNodeType.Rating]: defineAsyncComponent(() => import("@/components/Resource/Survey/Field/Rating.vue")),
  [SurveyNodeType.Slider]: defineAsyncComponent(() => import("@/components/Resource/Survey/Field/Slider.vue")),
  [SurveyNodeType.TagBox]: defineAsyncComponent(() => import("@/components/Resource/Survey/Field/TagBox.vue")),
  [SurveyNodeType.Text]: defineAsyncComponent(() => import("@/components/Resource/Survey/Field/Text.vue")),
};
