import { createSurveyNamedAnswerSchema } from "#src/services/runner/answer/createSurveyNamedAnswerSchema";
import { SURVEY_INVALID_ANSWER_MESSAGE, SURVEY_REQUIRED_MESSAGE } from "#src/services/runner/constants";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage.test";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(createSurveyNamedAnswerSchema, () => {
  const fields = [
    { isRequired: true, name: "a", schema: z.string() },
    { name: "b", schema: z.string() },
  ];

  test("accepts a record that leaves an optional field out", () => {
    expect.hasAssertions();

    const result = createSurveyNamedAnswerSchema(fields).safeParse({ a: "a" });

    expect(result.success).toBe(true);
  });

  test("refuses a key that no field declares", () => {
    expect.hasAssertions();

    const result = createSurveyNamedAnswerSchema(fields).safeParse({ a: "a", c: "c" });

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_INVALID_ANSWER_MESSAGE);
  });

  test("refuses a required field left out", () => {
    expect.hasAssertions();

    const result = createSurveyNamedAnswerSchema(fields).safeParse({ b: "b" });

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_REQUIRED_MESSAGE);
  });
});
