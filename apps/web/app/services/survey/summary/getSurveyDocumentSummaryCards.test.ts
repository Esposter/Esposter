import type { SurveyQuestionNode } from "vue-survey-engine-headless";

import { CHECKBOX_ANSWER_SEPARATOR } from "#shared/services/resource/survey/constants";
import { SurveySummaryCardType } from "@/models/resource/survey/SurveySummaryCardType";
import { getSurveyDocumentSummaryCards } from "@/services/survey/summary/getSurveyDocumentSummaryCards";
import { describe, expect, test } from "vitest";
import {
  surveyBooleanNodeType,
  surveyCheckboxNodeType,
  SurveyExpressionDisplayFormat,
  surveyExpressionNodeType,
  surveyHtmlNodeType,
  surveyImageNodeType,
  surveyImagePickerNodeType,
  SurveyNodeType,
  surveyRadioGroupNodeType,
  surveyRankingNodeType,
  surveyRatingNodeType,
  surveySliderNodeType,
  SurveyTextInputType,
  surveyTextNodeType,
} from "vue-survey-engine-headless";

describe(getSurveyDocumentSummaryCards, () => {
  const checkboxAnswers = ["a", "b"].join(CHECKBOX_ANSWER_SEPARATOR);
  const id = crypto.randomUUID();
  const responseId = crypto.randomUUID();
  const questions: SurveyQuestionNode[] = [
    {
      props: {
        ...surveyRadioGroupNodeType.createDefaultProps(),
        choices: [
          { text: "A", value: "a" },
          { text: "", value: "b" },
        ],
        id,
        name: "a",
        title: "b",
      },
      type: SurveyNodeType.RadioGroup,
    },
    {
      props: {
        ...surveyCheckboxNodeType.createDefaultProps(),
        choices: [
          { text: "", value: "a" },
          { text: "", value: "b" },
        ],
        id,
        name: "b",
      },
      type: SurveyNodeType.Checkbox,
    },
    { props: { ...surveyBooleanNodeType.createDefaultProps(), id, name: "c" }, type: SurveyNodeType.Boolean },
    {
      props: { ...surveyRatingNodeType.createDefaultProps(), id, name: "d", rateCount: 2 },
      type: SurveyNodeType.Rating,
    },
    {
      props: { ...surveyTextNodeType.createDefaultProps(), id, inputType: SurveyTextInputType.Number, name: "e" },
      type: SurveyNodeType.Text,
    },
    { props: { ...surveyTextNodeType.createDefaultProps(), id, name: "f" }, type: SurveyNodeType.Text },
  ];

  // A skipped question is left out of its own count, and a question taking several choices counts each one it holds
  test("counts each choice by its label, summarises numbers and lists written answers", () => {
    expect.hasAssertions();

    expect(
      getSurveyDocumentSummaryCards(questions, [
        { a: "a", b: checkboxAnswers, c: true, d: 1, e: 1, f: "a", responseId },
        { a: null, b: "a", c: false, d: 2, e: 3, f: "", responseId },
      ]),
    ).toStrictEqual([
      {
        answeredCount: 1,
        average: undefined,
        choices: [
          { count: 1, label: "A" },
          { count: 0, label: "b" },
        ],
        name: "a",
        title: "b",
        type: SurveySummaryCardType.Choice,
      },
      {
        answeredCount: 2,
        average: undefined,
        choices: [
          { count: 2, label: "a" },
          { count: 1, label: "b" },
        ],
        name: "b",
        title: "b",
        type: SurveySummaryCardType.Choice,
      },
      {
        answeredCount: 2,
        average: undefined,
        choices: [
          { count: 1, label: "Yes" },
          { count: 1, label: "No" },
        ],
        name: "c",
        title: "c",
        type: SurveySummaryCardType.Choice,
      },
      {
        answeredCount: 2,
        average: 1.5,
        choices: [
          { count: 1, label: "1" },
          { count: 1, label: "2" },
        ],
        name: "d",
        title: "d",
        type: SurveySummaryCardType.Choice,
      },
      {
        answeredCount: 2,
        average: 2,
        maximum: 3,
        minimum: 1,
        name: "e",
        title: "e",
        type: SurveySummaryCardType.Number,
      },
      { answeredCount: 1, answers: ["a"], name: "f", title: "f", type: SurveySummaryCardType.Text },
    ]);
  });

  // A choice's own value may hold the separator, so its answer counts as that one choice rather than as its fragments
  test("counts a checkbox choice whose value holds the separator as one choice", () => {
    expect.hasAssertions();

    const choiceQuestions: SurveyQuestionNode[] = [
      {
        props: {
          ...surveyCheckboxNodeType.createDefaultProps(),
          choices: [
            { text: "", value: `a${CHECKBOX_ANSWER_SEPARATOR}b` },
            { text: "", value: "a" },
          ],
          id,
          name: "a",
        },
        type: SurveyNodeType.Checkbox,
      },
    ];

    expect(
      getSurveyDocumentSummaryCards(choiceQuestions, [{ a: `a${CHECKBOX_ANSWER_SEPARATOR}b`, responseId }]),
    ).toStrictEqual([
      {
        answeredCount: 1,
        average: undefined,
        choices: [
          { count: 1, label: `a${CHECKBOX_ANSWER_SEPARATOR}b` },
          { count: 0, label: "a" },
        ],
        name: "a",
        title: "a",
        type: SurveySummaryCardType.Choice,
      },
    ]);
  });

  // A ranking holds every choice, so each answer counts the choices it ranks, wherever in its order they sit
  test("counts each ranked choice in every answer that ranks it", () => {
    expect.hasAssertions();

    const rankingQuestions: SurveyQuestionNode[] = [
      {
        props: {
          ...surveyRankingNodeType.createDefaultProps(),
          choices: [
            { text: "", value: "a" },
            { text: "", value: "b" },
            { text: "", value: "c" },
          ],
          id,
          name: "a",
        },
        type: SurveyNodeType.Ranking,
      },
    ];

    expect(
      getSurveyDocumentSummaryCards(rankingQuestions, [
        { a: `b${CHECKBOX_ANSWER_SEPARATOR}a${CHECKBOX_ANSWER_SEPARATOR}c`, responseId },
        { a: `a${CHECKBOX_ANSWER_SEPARATOR}c`, responseId },
      ]),
    ).toStrictEqual([
      {
        answeredCount: 2,
        average: undefined,
        choices: [
          { count: 2, label: "a" },
          { count: 1, label: "b" },
          { count: 2, label: "c" },
        ],
        name: "a",
        title: "a",
        type: SurveySummaryCardType.Choice,
      },
    ]);
  });

  // A multiple picker's answer lists the pictures picked, and each picture is labelled by its text rather than its value
  test("counts each picture a multiple image picker holds by its text", () => {
    expect.hasAssertions();

    const pickerQuestions: SurveyQuestionNode[] = [
      {
        props: {
          ...surveyImagePickerNodeType.createDefaultProps(),
          choices: [
            { imageLink: "", text: "A", value: "a" },
            { imageLink: "", text: "B", value: "b" },
          ],
          id,
          multiSelect: true,
          name: "a",
        },
        type: SurveyNodeType.ImagePicker,
      },
    ];

    expect(
      getSurveyDocumentSummaryCards(pickerQuestions, [
        { a: `a${CHECKBOX_ANSWER_SEPARATOR}b`, responseId },
        { a: "b", responseId },
      ]),
    ).toStrictEqual([
      {
        answeredCount: 2,
        average: undefined,
        choices: [
          { count: 1, label: "A" },
          { count: 2, label: "B" },
        ],
        name: "a",
        title: "a",
        type: SurveySummaryCardType.Choice,
      },
    ]);
  });

  // A slider's answers are numbers, so a zero is an answer like any other and counts toward the range and average
  test("summarises a slider's answers by their range and average", () => {
    expect.hasAssertions();

    const sliderQuestions: SurveyQuestionNode[] = [
      { props: { ...surveySliderNodeType.createDefaultProps(), id, name: "a" }, type: SurveyNodeType.Slider },
    ];

    expect(
      getSurveyDocumentSummaryCards(sliderQuestions, [
        { a: 0, responseId },
        { a: 1, responseId },
      ]),
    ).toStrictEqual([
      {
        answeredCount: 2,
        average: 0.5,
        maximum: 1,
        minimum: 0,
        name: "a",
        title: "a",
        type: SurveySummaryCardType.Number,
      },
    ]);
  });

  // An other answer is the typed answer itself, so it is counted under the other line once per response that holds one
  test("counts an other answer under its own line, once for each answer that holds one", () => {
    expect.hasAssertions();

    const otherQuestions: SurveyQuestionNode[] = [
      {
        props: {
          ...surveyRadioGroupNodeType.createDefaultProps(),
          choices: [{ text: "", value: "a" }],
          hasOther: true,
          id,
          name: "a",
        },
        type: SurveyNodeType.RadioGroup,
      },
      {
        props: {
          ...surveyCheckboxNodeType.createDefaultProps(),
          choices: [{ text: "", value: "a" }],
          hasOther: true,
          id,
          name: "b",
        },
        type: SurveyNodeType.Checkbox,
      },
    ];

    expect(
      getSurveyDocumentSummaryCards(otherQuestions, [
        { a: "a", b: `a${CHECKBOX_ANSWER_SEPARATOR}b`, responseId },
        { a: "b", b: "a", responseId },
      ]),
    ).toStrictEqual([
      {
        answeredCount: 2,
        average: undefined,
        choices: [
          { count: 1, label: "a" },
          { count: 1, label: "Other" },
        ],
        name: "a",
        title: "a",
        type: SurveySummaryCardType.Choice,
      },
      {
        answeredCount: 2,
        average: undefined,
        choices: [
          { count: 2, label: "a" },
          { count: 1, label: "Other" },
        ],
        name: "b",
        title: "b",
        type: SurveySummaryCardType.Choice,
      },
    ]);
  });

  // A calculated value shown as a percent is summarised as a number, and one shown as it is is listed as written
  test("summarises a calculated value shown as a percent as a number and one shown as it is as a list", () => {
    expect.hasAssertions();

    const expressionQuestions: SurveyQuestionNode[] = [
      {
        props: {
          ...surveyExpressionNodeType.createDefaultProps(),
          displayFormat: SurveyExpressionDisplayFormat.Percent,
          id,
          name: "a",
        },
        type: SurveyNodeType.Expression,
      },
      { props: { ...surveyExpressionNodeType.createDefaultProps(), id, name: "b" }, type: SurveyNodeType.Expression },
    ];

    expect(
      getSurveyDocumentSummaryCards(expressionQuestions, [
        { a: 0, b: 0, responseId },
        { a: 1, b: 1, responseId },
      ]),
    ).toStrictEqual([
      {
        answeredCount: 2,
        average: 0.5,
        maximum: 1,
        minimum: 0,
        name: "a",
        title: "a",
        type: SurveySummaryCardType.Number,
      },
      { answeredCount: 2, answers: ["0", "1"], name: "b", title: "b", type: SurveySummaryCardType.Text },
    ]);
  });

  // A descriptive element collects no answer, so it is given no card whatever rows the survey holds
  test("gives a descriptive element no card", () => {
    expect.hasAssertions();

    const descriptiveQuestions: SurveyQuestionNode[] = [
      { props: { ...surveyHtmlNodeType.createDefaultProps(), id, name: "a" }, type: SurveyNodeType.Html },
      { props: { ...surveyImageNodeType.createDefaultProps(), id, name: "b" }, type: SurveyNodeType.Image },
    ];

    expect(getSurveyDocumentSummaryCards(descriptiveQuestions, [{ a: "a", b: "b", responseId }])).toStrictEqual([]);
  });
});
