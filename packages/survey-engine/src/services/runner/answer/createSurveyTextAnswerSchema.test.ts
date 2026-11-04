import type { SurveyTextNode } from "#src/models/SurveyTextNode";
import type { SurveyTextNodeProps } from "#src/models/SurveyTextNodeProps";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { SurveyTextInputType } from "#src/models/SurveyTextInputType";
import { createSurveyTextAnswerSchema } from "#src/services/runner/answer/createSurveyTextAnswerSchema";
import {
  SURVEY_INVALID_ANSWER_MESSAGE,
  SURVEY_OUT_OF_RANGE_MESSAGE,
  SURVEY_REQUIRED_MESSAGE,
} from "#src/services/runner/constants";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage.test";
import { surveyTextNodeType } from "#src/services/surveyTextNodeType";
import { describe, expect, test } from "vitest";

const createTextNode = (props: Partial<SurveyTextNodeProps>): SurveyTextNode => ({
  props: { ...surveyTextNodeType.createDefaultProps(), id: crypto.randomUUID(), ...props },
  type: SurveyNodeType.Text,
});

describe(createSurveyTextAnswerSchema, () => {
  test("accepts a number inside the bounds its owner gives as text", () => {
    expect.hasAssertions();

    const schema = createSurveyTextAnswerSchema(
      createTextNode({ inputType: SurveyTextInputType.Number, max: "10", min: "1" }),
    );

    expect(schema.safeParse(5).success).toBe(true);
  });

  test("refuses a number below the minimum its owner gives as text", () => {
    expect.hasAssertions();

    const schema = createSurveyTextAnswerSchema(
      createTextNode({ inputType: SurveyTextInputType.Number, max: "10", min: "1" }),
    );

    expect(getSurveyFirstMessage(schema.safeParse(0))).toBe(SURVEY_OUT_OF_RANGE_MESSAGE);
  });

  test("accepts any number when its owner gives no bound", () => {
    expect.hasAssertions();

    const schema = createSurveyTextAnswerSchema(
      createTextNode({ inputType: SurveyTextInputType.Number, max: "", min: "" }),
    );

    expect(schema.safeParse(1000).success).toBe(true);
  });

  test("accepts a date within the bounds its owner gives, compared as text", () => {
    expect.hasAssertions();

    const schema = createSurveyTextAnswerSchema(
      createTextNode({ inputType: SurveyTextInputType.Date, max: "c", min: "a" }),
    );

    expect(schema.safeParse("b").success).toBe(true);
  });

  test("refuses a date before the minimum its owner gives", () => {
    expect.hasAssertions();

    const schema = createSurveyTextAnswerSchema(
      createTextNode({ inputType: SurveyTextInputType.Date, max: "c", min: "a" }),
    );

    expect(getSurveyFirstMessage(schema.safeParse("0"))).toBe(SURVEY_OUT_OF_RANGE_MESSAGE);
  });

  test("refuses an empty date", () => {
    expect.hasAssertions();

    const schema = createSurveyTextAnswerSchema(createTextNode({ inputType: SurveyTextInputType.Date }));

    expect(getSurveyFirstMessage(schema.safeParse(""))).toBe(SURVEY_REQUIRED_MESSAGE);
  });

  test("accepts an email address", () => {
    expect.hasAssertions();

    const schema = createSurveyTextAnswerSchema(createTextNode({ inputType: SurveyTextInputType.Email }));

    expect(schema.safeParse("a@a.co").success).toBe(true);
  });

  test("refuses text that is not an email address", () => {
    expect.hasAssertions();

    const schema = createSurveyTextAnswerSchema(createTextNode({ inputType: SurveyTextInputType.Email }));

    expect(getSurveyFirstMessage(schema.safeParse("a"))).toBe(SURVEY_INVALID_ANSWER_MESSAGE);
  });

  test("accepts a URL", () => {
    expect.hasAssertions();

    const schema = createSurveyTextAnswerSchema(createTextNode({ inputType: SurveyTextInputType.Url }));

    expect(schema.safeParse("https://a.co").success).toBe(true);
  });

  test("refuses text that is not a URL", () => {
    expect.hasAssertions();

    const schema = createSurveyTextAnswerSchema(createTextNode({ inputType: SurveyTextInputType.Url }));

    expect(getSurveyFirstMessage(schema.safeParse("a"))).toBe(SURVEY_INVALID_ANSWER_MESSAGE);
  });

  test("refuses text its owner's pattern does not match", () => {
    expect.hasAssertions();

    const schema = createSurveyTextAnswerSchema(createTextNode({ pattern: "[0-9]+" }));

    expect(getSurveyFirstMessage(schema.safeParse("a"))).toBe(SURVEY_INVALID_ANSWER_MESSAGE);
  });
});
