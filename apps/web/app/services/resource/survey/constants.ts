// @unocss-include
import type { UiMenuItem } from "@/models/ui/UiMenuItem";
import type { SurveyMultipleTextItemInputType } from "vue-survey-engine-headless";

import { SurveyConditionJoin } from "@/models/resource/survey/SurveyConditionJoin";
import { SurveyConditionOperator } from "@/models/resource/survey/SurveyConditionOperator";
import { SurveyConditionProp } from "@/models/resource/survey/SurveyConditionProp";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { SurveyImageFit, SurveyNodeType, SurveyTextInputType } from "vue-survey-engine-headless";
import { SurveyExpressionBinaryOperator } from "survey-expression";

// The conditions a node's editor shows, each under its label, in the order the editor lists them
export const SURVEY_CONDITION_SECTIONS: readonly { label: string; prop: SurveyConditionProp }[] = [
  { label: "Visible if", prop: SurveyConditionProp.VisibleIf },
  { label: "Enabled if", prop: SurveyConditionProp.EnableIf },
  { label: "Required if", prop: SurveyConditionProp.RequiredIf },
];

// The comparison each binary operator of the expression language is, where an operator with no condition row is not in the map
export const SURVEY_CONDITION_BINARY_OPERATORS: Readonly<
  Partial<Record<SurveyExpressionBinaryOperator, SurveyConditionOperator>>
> = {
  [SurveyExpressionBinaryOperator.Contains]: SurveyConditionOperator.Contains,
  [SurveyExpressionBinaryOperator.Equal]: SurveyConditionOperator.Equals,
  [SurveyExpressionBinaryOperator.Greater]: SurveyConditionOperator.Greater,
  [SurveyExpressionBinaryOperator.GreaterOrEqual]: SurveyConditionOperator.GreaterOrEquals,
  [SurveyExpressionBinaryOperator.Less]: SurveyConditionOperator.Less,
  [SurveyExpressionBinaryOperator.LessOrEqual]: SurveyConditionOperator.LessOrEquals,
  [SurveyExpressionBinaryOperator.NotContains]: SurveyConditionOperator.NotContains,
  [SurveyExpressionBinaryOperator.NotEqual]: SurveyConditionOperator.NotEquals,
};

// The operators a text, a number, a choice or a calculated value offers
export const SURVEY_SCALAR_CONDITION_OPERATORS: readonly SurveyConditionOperator[] = [
  SurveyConditionOperator.Equals,
  SurveyConditionOperator.NotEquals,
  SurveyConditionOperator.Greater,
  SurveyConditionOperator.GreaterOrEquals,
  SurveyConditionOperator.Less,
  SurveyConditionOperator.LessOrEquals,
  SurveyConditionOperator.Contains,
  SurveyConditionOperator.NotContains,
  SurveyConditionOperator.Empty,
  SurveyConditionOperator.NotEmpty,
];

// The operators a list of answers offers, which is a question of what it holds rather than how much
export const SURVEY_LIST_CONDITION_OPERATORS: readonly SurveyConditionOperator[] = [
  SurveyConditionOperator.Contains,
  SurveyConditionOperator.NotContains,
  SurveyConditionOperator.Empty,
  SurveyConditionOperator.NotEmpty,
];

// The operators a yes or no answer offers, since it is either true or false
export const SURVEY_BOOLEAN_CONDITION_OPERATORS: readonly SurveyConditionOperator[] = [
  SurveyConditionOperator.Equals,
  SurveyConditionOperator.NotEquals,
  SurveyConditionOperator.Empty,
  SurveyConditionOperator.NotEmpty,
];

export const SURVEY_CONDITION_OPERATOR_TITLES: Readonly<Record<SurveyConditionOperator, string>> = {
  [SurveyConditionOperator.Contains]: "contains",
  [SurveyConditionOperator.Empty]: "is empty",
  [SurveyConditionOperator.Equals]: "equals",
  [SurveyConditionOperator.Greater]: "is greater than",
  [SurveyConditionOperator.GreaterOrEquals]: "is at least",
  [SurveyConditionOperator.Less]: "is less than",
  [SurveyConditionOperator.LessOrEquals]: "is at most",
  [SurveyConditionOperator.NotContains]: "does not contain",
  [SurveyConditionOperator.NotEmpty]: "is not empty",
  [SurveyConditionOperator.NotEquals]: "does not equal",
};

export const SURVEY_CONDITION_JOIN_ITEMS: UiMenuItem<SurveyConditionJoin>[] = [
  { title: "All of these", value: SurveyConditionJoin.And },
  { title: "Any of these", value: SurveyConditionJoin.Or },
];

// A yes or no answer is compared with the boolean its value names
export const SURVEY_BOOLEAN_VALUE_ITEMS: UiMenuItem<string>[] = [
  { title: "Yes", value: "true" },
  { title: "No", value: "false" },
];

export const SURVEY_CONDITION_ADVANCED_MESSAGE = "This is an advanced expression, so it is edited as text below.";

export const SURVEY_REFUSED_MESSAGE = "This cannot be saved as written";

export const SURVEY_CALCULATED_VALUE_NAME_REQUIRED_MESSAGE = "Give the value a name";

// The pointer a survey's calculated values are listed under, which the survey check names a value's issue by
export const SURVEY_CALCULATED_VALUES_POINTER = "/root/props/calculatedValues";

// The name and expression a new calculated value starts with, the name numbered past any answer already holding it
export const SURVEY_CALCULATED_VALUE_NAME = "value";
export const SURVEY_CALCULATED_VALUE_EXPRESSION = "0";

// The kinds that order their choices by the session's seed, so each takes the seed the runner passes down
export const SURVEY_SEEDED_NODE_TYPES: ReadonlySet<SurveyNodeType> = new Set([
  SurveyNodeType.Checkbox,
  SurveyNodeType.Dropdown,
  SurveyNodeType.PanelDynamic,
  SurveyNodeType.RadioGroup,
  SurveyNodeType.TagBox,
]);

export const SURVEY_FOCUSABLE_SELECTOR = "input, select, textarea, button";

// The class each fit draws a picture with, written whole so the utility generator sees every one
export const SURVEY_IMAGE_FIT_CLASSES: Readonly<Record<SurveyImageFit, string>> = {
  [SurveyImageFit.Contain]: "object-contain",
  [SurveyImageFit.Cover]: "object-cover",
  [SurveyImageFit.Fill]: "object-fill",
  [SurveyImageFit.None]: "object-none",
};

// The faces a smiley rating runs through, from the angriest to the happiest, one step of the scale to each face in turn
export const SURVEY_SMILEY_MEANINGS: readonly UiIconMeaning[] = [
  UiIconMeaning.SmileyVeryUnhappy,
  UiIconMeaning.SmileyUnhappy,
  UiIconMeaning.SmileyNeutral,
  UiIconMeaning.SmileyHappy,
  UiIconMeaning.SmileyVeryHappy,
];

// The input types the library's text field draws as its own control, for a text question and for each item of a multiple
// Text question, which takes a narrower list of them; the rest are typed as plain text
export const SURVEY_TEXT_FIELD_TYPES: Readonly<
  Partial<Record<`${SurveyMultipleTextItemInputType | SurveyTextInputType}`, UiTextFieldType>>
> = {
  [SurveyTextInputType.Email]: UiTextFieldType.Email,
  [SurveyTextInputType.Number]: UiTextFieldType.Number,
  [SurveyTextInputType.Password]: UiTextFieldType.Password,
  [SurveyTextInputType.Tel]: UiTextFieldType.Tel,
  [SurveyTextInputType.Time]: UiTextFieldType.Time,
  [SurveyTextInputType.Url]: UiTextFieldType.Url,
};
// The kinds the palette offers, in the groups it draws them under. The page is the toolbar's to add
export const SURVEY_PALETTE_GROUPS: readonly { title: string; types: SurveyNodeType[] }[] = [
  { title: "Text", types: [SurveyNodeType.Text, SurveyNodeType.Comment, SurveyNodeType.MultipleText] },
  {
    title: "Choice",
    types: [
      SurveyNodeType.RadioGroup,
      SurveyNodeType.Checkbox,
      SurveyNodeType.Dropdown,
      SurveyNodeType.TagBox,
      SurveyNodeType.ButtonGroup,
      SurveyNodeType.Boolean,
      SurveyNodeType.ImagePicker,
    ],
  },
  { title: "Scale and ranking", types: [SurveyNodeType.Rating, SurveyNodeType.Slider, SurveyNodeType.Ranking] },
  {
    title: "Grids and repeats",
    types: [SurveyNodeType.Matrix, SurveyNodeType.MatrixDynamic, SurveyNodeType.PanelDynamic],
  },
  { title: "Content", types: [SurveyNodeType.Html, SurveyNodeType.Image, SurveyNodeType.Expression] },
  { title: "Layout", types: [SurveyNodeType.Panel] },
];

// The two views the toolbar switches between, titled and valued by the same name
export const SURVEY_DESIGN_MODE = "Design";
export const SURVEY_PREVIEW_MODE = "Preview";

// The pixel height of the bar across the top of the creator, one row of its touch-sized controls
export const SURVEY_BAR_HEIGHT = 48;

// The key the other option of a choice question is drawn under, with its title, and the title its none option falls back to
export const SURVEY_OTHER_KEY = "other";
export const SURVEY_OTHER_TITLE = "Other";
export const SURVEY_NONE_TITLE = "None";

// The creator's command group, which its undo, redo and move shortcuts are listed under
export const SURVEY_CREATOR_COMMAND_GROUP = "Survey creator";
