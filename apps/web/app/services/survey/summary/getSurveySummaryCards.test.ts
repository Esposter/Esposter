import { CHECKBOX_ANSWER_SEPARATOR } from "#shared/services/resource/survey/constants";
import { SurveySummaryCardType } from "@/models/resource/survey/SurveySummaryCardType";
import { getSurveySummaryCards } from "@/services/survey/summary/getSurveySummaryCards";
import { Model } from "survey-core";
import { describe, expect, test } from "vitest";

describe(getSurveySummaryCards, () => {
  const checkboxAnswers = ["a", "b"].join(CHECKBOX_ANSWER_SEPARATOR);
  const rowKey = crypto.randomUUID();
  const questions = new Model({
    elements: [
      { choices: [{ text: "A", value: "a" }, "b"], name: "a", title: "Radiogroup", type: "radiogroup" },
      { choices: ["a", "b"], name: "b", type: "checkbox" },
      { name: "c", type: "boolean" },
      { name: "d", rateMax: 2, type: "rating" },
      { inputType: "number", name: "e", type: "text" },
      { name: "f", type: "text" },
    ],
  }).getAllQuestions();

  // A skipped question is left out of its own count, and a question taking several choices counts each one it holds
  test("counts each choice by its label, summarises numbers and lists written answers", () => {
    expect.hasAssertions();

    expect(
      getSurveySummaryCards(questions, [
        { a: "a", b: checkboxAnswers, c: true, d: 1, e: 1, f: "a", rowKey },
        { a: null, b: "a", c: false, d: 2, e: 3, f: "", rowKey },
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
        title: "Radiogroup",
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

    const choiceQuestions = new Model({
      elements: [{ choices: ["Yes; definitely", "Yes"], name: "a", type: "checkbox" }],
    }).getAllQuestions();

    expect(getSurveySummaryCards(choiceQuestions, [{ a: "Yes; definitely", rowKey }])).toStrictEqual([
      {
        answeredCount: 1,
        average: undefined,
        choices: [
          { count: 1, label: "Yes; definitely" },
          { count: 0, label: "Yes" },
        ],
        name: "a",
        title: "a",
        type: SurveySummaryCardType.Choice,
      },
    ]);
  });
});
