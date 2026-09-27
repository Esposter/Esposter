import { SurveySummaryCardType } from "@/models/resource/survey/SurveySummaryCardType";
import { getSurveySummaryCards } from "@/services/survey/summary/getSurveySummaryCards";
import { Model } from "survey-core";
import { describe, expect, test } from "vitest";

describe(getSurveySummaryCards, () => {
  const rowKey = "rowKey";
  const questions = new Model({
    elements: [
      { choices: [{ text: "A", value: "a" }, "b"], name: "radiogroup", title: "Radiogroup", type: "radiogroup" },
      { choices: ["a", "b"], name: "checkbox", type: "checkbox" },
      { name: "boolean", type: "boolean" },
      { name: "rating", rateMax: 2, type: "rating" },
      { inputType: "number", name: "number", type: "text" },
      { name: "text", type: "text" },
    ],
  }).getAllQuestions();

  // A skipped question is left out of its own count, and a question taking several choices counts each one it holds
  test("counts each choice by its label, summarises numbers and lists written answers", () => {
    expect.hasAssertions();

    expect(
      getSurveySummaryCards(questions, [
        { boolean: true, checkbox: '["a","b"]', number: 1, radiogroup: "a", rating: 1, rowKey, text: "text" },
        { boolean: false, checkbox: '["a"]', number: 3, radiogroup: null, rating: 2, rowKey, text: "" },
      ]),
    ).toStrictEqual([
      {
        answeredCount: 1,
        average: undefined,
        choices: [
          { count: 1, label: "A" },
          { count: 0, label: "b" },
        ],
        name: "radiogroup",
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
        name: "checkbox",
        title: "checkbox",
        type: SurveySummaryCardType.Choice,
      },
      {
        answeredCount: 2,
        average: undefined,
        choices: [
          { count: 1, label: "Yes" },
          { count: 1, label: "No" },
        ],
        name: "boolean",
        title: "boolean",
        type: SurveySummaryCardType.Choice,
      },
      {
        answeredCount: 2,
        average: 1.5,
        choices: [
          { count: 1, label: "1" },
          { count: 1, label: "2" },
        ],
        name: "rating",
        title: "rating",
        type: SurveySummaryCardType.Choice,
      },
      {
        answeredCount: 2,
        average: 2,
        maximum: 3,
        minimum: 1,
        name: "number",
        title: "number",
        type: SurveySummaryCardType.Number,
      },
      { answeredCount: 1, answers: ["text"], name: "text", title: "text", type: SurveySummaryCardType.Text },
    ]);
  });
});
