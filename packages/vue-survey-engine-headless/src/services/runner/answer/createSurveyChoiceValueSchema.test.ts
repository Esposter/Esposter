import { createSurveyChoiceValueSchema } from "#src/services/runner/answer/createSurveyChoiceValueSchema";
import { SURVEY_NONE_ANSWER, SURVEY_NOT_A_CHOICE_MESSAGE } from "#src/services/runner/constants";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage";
import { describe, expect, test } from "vitest";

describe(createSurveyChoiceValueSchema, () => {
  const choices = [
    { text: "", value: "a" },
    { text: "", value: 1 },
  ];

  test("accepts a value equal to one of its choices, text or number", () => {
    expect.hasAssertions();

    const schema = createSurveyChoiceValueSchema({ choices });

    expect(schema.safeParse("a").success).toBe(true);
    expect(schema.safeParse(1).success).toBe(true);
  });

  test("refuses a value that is none of its choices", () => {
    expect.hasAssertions();

    const result = createSurveyChoiceValueSchema({ choices }).safeParse("b");

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_NOT_A_CHOICE_MESSAGE);
  });

  test("refuses every value when it has no choice to take", () => {
    expect.hasAssertions();

    const result = createSurveyChoiceValueSchema({ choices: [] }).safeParse("a");

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_NOT_A_CHOICE_MESSAGE);
  });

  test("accepts the none answer when it has one", () => {
    expect.hasAssertions();

    const result = createSurveyChoiceValueSchema({ choices, hasNone: true }).safeParse(SURVEY_NONE_ANSWER);

    expect(result.success).toBe(true);
  });

  test("refuses the none answer when it has none", () => {
    expect.hasAssertions();

    const result = createSurveyChoiceValueSchema({ choices }).safeParse(SURVEY_NONE_ANSWER);

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_NOT_A_CHOICE_MESSAGE);
  });

  test("accepts any text as its other answer when it has one", () => {
    expect.hasAssertions();

    const result = createSurveyChoiceValueSchema({ choices, hasOther: true }).safeParse("b");

    expect(result.success).toBe(true);
  });
});
