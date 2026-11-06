import type { SurveyMatrixNode } from "#src/models/SurveyMatrixNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyMatrixAnswerSchema } from "#src/services/runner/answer/createSurveyMatrixAnswerSchema";
import { SURVEY_INVALID_ANSWER_MESSAGE, SURVEY_REQUIRED_MESSAGE } from "#src/services/runner/constants";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage";
import { surveyMatrixNodeType } from "#src/services/surveyMatrixNodeType";
import { describe, expect, test } from "vitest";

const createMatrixNode = (isAllRowRequired: boolean): SurveyMatrixNode => ({
  props: {
    ...surveyMatrixNodeType.createDefaultProps(),
    columns: [
      { text: "", value: "x" },
      { text: "", value: "y" },
    ],
    id: crypto.randomUUID(),
    isAllRowRequired,
    rows: [
      { text: "", value: "a" },
      { text: "", value: "b" },
    ],
  },
  type: SurveyNodeType.Matrix,
});

describe(createSurveyMatrixAnswerSchema, () => {
  test("accepts a matrix that answers only some rows when not every row is required", () => {
    expect.hasAssertions();

    const result = createSurveyMatrixAnswerSchema(createMatrixNode(false)).safeParse({ a: "x" });

    expect(result.success).toBe(true);
  });

  test("refuses a matrix that leaves a row out when every row is required", () => {
    expect.hasAssertions();

    const result = createSurveyMatrixAnswerSchema(createMatrixNode(true)).safeParse({ a: "x" });

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_REQUIRED_MESSAGE);
  });

  test("refuses a row that is none of its rows", () => {
    expect.hasAssertions();

    const result = createSurveyMatrixAnswerSchema(createMatrixNode(false)).safeParse({ c: "x" });

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_INVALID_ANSWER_MESSAGE);
  });
});
