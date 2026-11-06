import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { SurveyNodeType } from "vue-survey-engine-headless";

// The icon each survey kind is listed under, the closest meaning the icon set has for it, where a few kinds share one
export const SurveyNodeTypeIconMap = {
  [SurveyNodeType.Boolean]: UiIconMeaning.Selected,
  [SurveyNodeType.ButtonGroup]: UiIconMeaning.Button,
  [SurveyNodeType.Checkbox]: UiIconMeaning.SelectAll,
  [SurveyNodeType.Comment]: UiIconMeaning.Comment,
  [SurveyNodeType.Dropdown]: UiIconMeaning.Dropdown,
  [SurveyNodeType.Expression]: UiIconMeaning.Aggregate,
  [SurveyNodeType.Html]: UiIconMeaning.ReadableText,
  [SurveyNodeType.Image]: UiIconMeaning.Image,
  [SurveyNodeType.ImagePicker]: UiIconMeaning.Carousel,
  [SurveyNodeType.Matrix]: UiIconMeaning.Sheet,
  [SurveyNodeType.MatrixDynamic]: UiIconMeaning.Rows,
  [SurveyNodeType.MultipleText]: UiIconMeaning.Pen,
  [SurveyNodeType.Page]: UiIconMeaning.File,
  [SurveyNodeType.Panel]: UiIconMeaning.Group,
  [SurveyNodeType.PanelDynamic]: UiIconMeaning.Copy,
  [SurveyNodeType.RadioGroup]: UiIconMeaning.Selected,
  [SurveyNodeType.Ranking]: UiIconMeaning.SortAscending,
  [SurveyNodeType.Rating]: UiIconMeaning.Star,
  [SurveyNodeType.Slider]: UiIconMeaning.Tools,
  [SurveyNodeType.TagBox]: UiIconMeaning.Tag,
  [SurveyNodeType.Text]: UiIconMeaning.Keyboard,
} as const satisfies Record<SurveyNodeType, UiIconMeaning>;
