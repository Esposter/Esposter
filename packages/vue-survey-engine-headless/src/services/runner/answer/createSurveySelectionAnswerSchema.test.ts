import { createSurveySelectionAnswerSchema } from "#src/services/runner/answer/createSurveySelectionAnswerSchema";
import {
  SURVEY_INVALID_ANSWER_MESSAGE,
  SURVEY_NONE_ANSWER,
  SURVEY_TOO_FEW_SELECTED_MESSAGE,
  SURVEY_TOO_MANY_SELECTED_MESSAGE,
} from "#src/services/runner/constants";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage";
import { describe, expect, test } from "vitest";

describe(createSurveySelectionAnswerSchema, () => {
  const choices = [
    { text: "", value: "a" },
    { text: "", value: "b" },
    { text: "", value: "c" },
  ];

  test("accepts a list of distinct choices within its bounds", () => {
    expect.hasAssertions();

    const result = createSurveySelectionAnswerSchema({ choices, maxSelected: 2, minSelected: 1 }).safeParse(["a", "b"]);

    expect(result.success).toBe(true);
  });

  test("refuses fewer choices than its minimum", () => {
    expect.hasAssertions();

    const result = createSurveySelectionAnswerSchema({ choices, minSelected: 2 }).safeParse(["a"]);

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_TOO_FEW_SELECTED_MESSAGE);
  });

  test("refuses more choices than its maximum", () => {
    expect.hasAssertions();

    const result = createSurveySelectionAnswerSchema({ choices, maxSelected: 1 }).safeParse(["a", "b"]);

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_TOO_MANY_SELECTED_MESSAGE);
  });

  test("refuses a choice picked twice", () => {
    expect.hasAssertions();

    const result = createSurveySelectionAnswerSchema({ choices }).safeParse(["a", "a"]);

    expect(result.success).toBe(false);
  });

  test("accepts none picked alone when it has one", () => {
    expect.hasAssertions();

    const result = createSurveySelectionAnswerSchema({ choices, hasNone: true }).safeParse([SURVEY_NONE_ANSWER]);

    expect(result.success).toBe(true);
  });

  test("refuses none picked beside another choice", () => {
    expect.hasAssertions();

    const result = createSurveySelectionAnswerSchema({ choices, hasNone: true }).safeParse([SURVEY_NONE_ANSWER, "a"]);

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_INVALID_ANSWER_MESSAGE);
  });
});
