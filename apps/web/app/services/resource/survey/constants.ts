import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { SurveyConditionJoin } from "@/models/resource/survey/SurveyConditionJoin";
import { SurveyConditionOperator } from "@/models/resource/survey/SurveyConditionOperator";
import { SurveyConditionProp } from "@/models/resource/survey/SurveyConditionProp";
import { SurveyExpressionBinaryOperator } from "survey-logic";

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
