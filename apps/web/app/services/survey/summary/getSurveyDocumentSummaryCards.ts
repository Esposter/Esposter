import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { SurveyResponseRecord } from "#shared/models/resource/survey/SurveyResponseRecord";
import type { BaseSurveySummaryCard } from "@/models/resource/survey/BaseSurveySummaryCard";
import type { SurveySummaryCard } from "@/models/resource/survey/SurveySummaryCard";
import type { SurveyChoice, SurveyQuestionNode } from "vue-survey-engine-headless";

import { getAverage } from "#shared/services/resource/sheet/column/getAverage";
import { CHECKBOX_ANSWER_SEPARATOR } from "#shared/services/resource/survey/constants";
import { SurveySummaryCardType } from "@/models/resource/survey/SurveySummaryCardType";
import { SURVEY_SUMMARY_ANSWER_LIMIT } from "@/services/survey/summary/constants";
import {
  checkIsSurveyAnsweringNode,
  getSurveyChoiceText,
  SurveyExpressionDisplayFormat,
  SurveyNodeType,
  SurveyTextInputType,
} from "vue-survey-engine-headless";

type Answer = NonNullable<ColumnValue>;

interface ChoiceOption {
  label: string;
  value: Answer;
}

// What a choice card counts: its options, whether an answer lists several of them, and the label of its other option
// The label is set only when the question offers one
interface ChoiceSource {
  isMultiple: boolean;
  options: ChoiceOption[];
  otherLabel?: string;
}

// The label an other answer is counted under when its question gives the other option no text of its own
const DEFAULT_OTHER_LABEL = "Other";

const toChoiceOptions = (choices: SurveyChoice[]): ChoiceOption[] =>
  choices.map((choice) => ({ label: getSurveyChoiceText(choice), value: choice.value }));

// A rating's steps run from one to its count, each labelled by its own value
const toRatingOptions = (rateCount: number): ChoiceOption[] =>
  Array.from({ length: rateCount }, (_value, index) => ({ label: String(index + 1), value: index + 1 }));

// An other option is only offered by a question that has one, so the label is set only then
const toOtherSource = ({
  hasOther,
  otherText,
}: {
  hasOther: boolean;
  otherText: string;
}): Pick<ChoiceSource, "otherLabel"> => (hasOther ? { otherLabel: otherText || DEFAULT_OTHER_LABEL } : {});

// A boolean's two answers and a rating's steps are its choices, so they are counted as a choice question's are
const getChoiceSource = (question: SurveyQuestionNode): ChoiceSource | undefined => {
  switch (question.type) {
    case SurveyNodeType.Boolean:
      return {
        isMultiple: false,
        options: [
          { label: question.props.labelTrue || "Yes", value: true },
          { label: question.props.labelFalse || "No", value: false },
        ],
      };
    case SurveyNodeType.ButtonGroup:
      return { isMultiple: false, options: toChoiceOptions(question.props.choices) };
    case SurveyNodeType.Checkbox:
    case SurveyNodeType.TagBox:
      return { isMultiple: true, options: toChoiceOptions(question.props.choices), ...toOtherSource(question.props) };
    case SurveyNodeType.Dropdown:
    case SurveyNodeType.RadioGroup:
      return { isMultiple: false, options: toChoiceOptions(question.props.choices), ...toOtherSource(question.props) };
    case SurveyNodeType.ImagePicker:
      return { isMultiple: question.props.multiSelect, options: toChoiceOptions(question.props.choices) };
    case SurveyNodeType.Ranking:
      return { isMultiple: true, options: toChoiceOptions(question.props.choices) };
    case SurveyNodeType.Rating:
      return { isMultiple: false, options: toRatingOptions(question.props.rateCount) };
    default:
      return undefined;
  }
};

// A question whose answers are numbers is summarised by their range and average rather than listed
const checkIsNumberQuestion = (question: SurveyQuestionNode): boolean => {
  switch (question.type) {
    case SurveyNodeType.Expression:
      return question.props.displayFormat !== SurveyExpressionDisplayFormat.None;
    case SurveyNodeType.Slider:
      return true;
    case SurveyNodeType.Text:
      return question.props.inputType === SurveyTextInputType.Number;
    default:
      return false;
  }
};

// The longest choice value the rest of a multiple answer starts with, as its whole or as one segment of it
const getLeadingChoiceValue = (rest: string, longestFirst: string[]): string | undefined =>
  longestFirst.find((value) => rest === value || rest.startsWith(`${value}${CHECKBOX_ANSWER_SEPARATOR}`));

// A choice's value may hold the separator, so a multiple answer is read against the choice values, not split on it.
// A segment that starts no choice value is an other answer, read up to the next separator
const getMultipleAnswerValues = (answer: string, longestFirst: string[]): string[] => {
  const answeredValues: string[] = [];
  let rest = answer;
  while (rest.length > 0) {
    const choiceValue = getLeadingChoiceValue(rest, longestFirst);
    if (choiceValue === undefined) {
      const separatorIndex = rest.indexOf(CHECKBOX_ANSWER_SEPARATOR);
      answeredValues.push(separatorIndex === -1 ? rest : rest.slice(0, separatorIndex));
      rest = separatorIndex === -1 ? "" : rest.slice(separatorIndex + CHECKBOX_ANSWER_SEPARATOR.length);
    } else {
      answeredValues.push(choiceValue);
      rest = rest.slice(choiceValue.length + CHECKBOX_ANSWER_SEPARATOR.length);
    }
  }
  return answeredValues;
};

// The values an answer holds: a multiple answer's segments, or the one value of any other answer
const getAnswerValues = (answer: Answer, isMultiple: boolean, longestFirst: string[]): string[] =>
  isMultiple && typeof answer === "string" ? getMultipleAnswerValues(answer, longestFirst) : [String(answer)];

// Each option is counted by the answers holding its value, and the other option by the answers holding a value that no
// Option has, once per answer however many such values it holds
const getChoiceCard = (
  base: BaseSurveySummaryCard,
  source: ChoiceSource,
  answers: Answer[],
  average: number | undefined,
): SurveySummaryCard => {
  const optionValues = source.options.map(({ value }) => String(value));
  const longestFirst = optionValues.toSorted((firstValue, secondValue) => secondValue.length - firstValue.length);
  const answeredValues = answers.map((answer) => getAnswerValues(answer, source.isMultiple, longestFirst));
  const choices = source.options.map(({ label, value }) => ({
    count: answeredValues.filter((values) => values.includes(String(value))).length,
    label,
  }));
  const otherChoices =
    source.otherLabel === undefined
      ? []
      : [
          {
            count: answeredValues.filter((values) => values.some((value) => !optionValues.includes(value))).length,
            label: source.otherLabel,
          },
        ];
  return { ...base, average, choices: [...choices, ...otherChoices], type: SurveySummaryCardType.Choice };
};

const getQuestionCard = (
  question: SurveyQuestionNode,
  base: BaseSurveySummaryCard,
  answers: Answer[],
): SurveySummaryCard => {
  const choiceSource = getChoiceSource(question);
  if (choiceSource) {
    const average =
      question.type === SurveyNodeType.Rating && answers.length > 0 ? getAverage(answers.map(Number)) : undefined;
    return getChoiceCard(base, choiceSource, answers, average);
  }
  if (checkIsNumberQuestion(question) && answers.length > 0) {
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
};

// One card per question that holds an answer, in the survey's own order and drawn by what kind of question it is. A choice
// Is shown by its label rather than the value stored for it
export const getSurveyDocumentSummaryCards = (
  questions: SurveyQuestionNode[],
  rows: SurveyResponseRecord[],
): SurveySummaryCard[] =>
  questions
    .filter((question) => checkIsSurveyAnsweringNode(question))
    .map((question) => {
      const { name } = question.props;
      const answers = rows.flatMap((row) => {
        const value = row[name];
        return value === null || value === undefined || value === "" ? [] : [value];
      });
      return getQuestionCard(
        question,
        { answeredCount: answers.length, name, title: question.props.title || name },
        answers,
      );
    });
