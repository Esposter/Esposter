import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { SurveyResponseRecord } from "#shared/models/resource/survey/SurveyResponseRecord";
import type { SurveySummaryCard } from "@/models/resource/survey/SurveySummaryCard";
import type { Question } from "survey-core";

import { getAverage } from "#shared/services/resource/sheet/column/getAverage";
import { CHECKBOX_ANSWER_SEPARATOR } from "#shared/services/resource/survey/constants";
import { SurveySummaryCardType } from "@/models/resource/survey/SurveySummaryCardType";
import { SURVEY_SUMMARY_ANSWER_LIMIT } from "@/services/survey/summary/constants";
import {
  QuestionBooleanModel,
  QuestionCheckboxModel,
  QuestionRatingModel,
  QuestionSelectBase,
  QuestionTextModel,
} from "survey-core";

// The longest choice value that the answer starts with, as one segment of the answer or as the whole of it
const getLeadingChoiceValue = (answer: string, longestFirst: string[]) =>
  longestFirst.find((value) => answer === value || answer.startsWith(`${value}${CHECKBOX_ANSWER_SEPARATOR}`));
// A choice's value may hold the separator, so the answer is read against the choice values, not split on it
const getCheckboxAnswerValues = (answer: string, choiceValues: string[]): string[] => {
  const longestFirst = choiceValues.toSorted(
    (firstChoiceValue, secondChoiceValue) => secondChoiceValue.length - firstChoiceValue.length,
  );
  const answeredValues: string[] = [];
  let rest = answer;
  while (rest.length > 0) {
    const choiceValue = getLeadingChoiceValue(rest, longestFirst);
    if (choiceValue === undefined) {
      const separatorIndex = rest.indexOf(CHECKBOX_ANSWER_SEPARATOR);
      if (separatorIndex === -1) break;
      rest = rest.slice(separatorIndex + CHECKBOX_ANSWER_SEPARATOR.length);
    } else {
      answeredValues.push(choiceValue);
      rest = rest.slice(choiceValue.length + CHECKBOX_ANSWER_SEPARATOR.length);
    }
  }
  return answeredValues;
};
// A question taking several choices holds them in one answer, every other answer is its one value
const getAnsweredValues = (question: Question, value: ColumnValue, choiceValues: string[]): string[] => {
  if (question instanceof QuestionCheckboxModel && typeof value === "string")
    return getCheckboxAnswerValues(value, choiceValues);
  return [String(value)];
};
const getChoices = (question: Question): { label: string; value: unknown }[] => {
  if (question instanceof QuestionBooleanModel)
    return [
      { label: question.labelTrue || "Yes", value: question.getValueTrue() },
      { label: question.labelFalse || "No", value: question.getValueFalse() },
    ];
  else if (question instanceof QuestionRatingModel)
    return question.visibleRateValues.map(({ text, value }) => ({ label: text, value }));
  else if (question instanceof QuestionSelectBase)
    return question.visibleChoices.map(({ text, value }) => ({ label: text, value }));
  else return [];
};
// One card per question the responses hold, in the survey's own order, drawn by what kind of question it is. Choices
// Are shown by their labels rather than the values stored for them
export const getSurveySummaryCards = (questions: Question[], rows: SurveyResponseRecord[]): SurveySummaryCard[] =>
  questions.map((question) => {
    const { name, processedTitle: title } = question;
    const answers = rows.flatMap((row) => {
      const value = row[name];
      return value === null || value === undefined || value === "" ? [] : [value];
    });
    const base = { answeredCount: answers.length, name, title };
    const choices = getChoices(question);
    if (choices.length > 0) {
      const choiceValues = choices.map(({ value }) => String(value));
      const answeredValues = answers.map((value) => getAnsweredValues(question, value, choiceValues));
      return {
        ...base,
        average:
          question instanceof QuestionRatingModel && answers.length > 0 ? getAverage(answers.map(Number)) : undefined,
        choices: choices.map(({ label, value }) => ({
          count: answeredValues.filter((values) => values.includes(String(value))).length,
          label,
        })),
        type: SurveySummaryCardType.Choice,
      };
    } else if (question instanceof QuestionTextModel && question.inputType === "number" && answers.length > 0) {
      const numbers = answers.map(Number);
      return {
        ...base,
        average: getAverage(numbers),
        maximum: Math.max(...numbers),
        minimum: Math.min(...numbers),
        type: SurveySummaryCardType.Number,
      };
    }
    return {
      ...base,
      answers: answers.slice(0, SURVEY_SUMMARY_ANSWER_LIMIT).map(String),
      type: SurveySummaryCardType.Text,
    };
  });
