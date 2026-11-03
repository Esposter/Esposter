import type { SurveyMatrixDynamicNode } from "#src/models/SurveyMatrixDynamicNode";

import { SurveyMatrixCellType } from "#src/models/SurveyMatrixCellType";
import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyMatrixDynamicAnswerSchema } from "#src/services/runner/answer/createSurveyMatrixDynamicAnswerSchema";
import {
  SURVEY_INVALID_ANSWER_MESSAGE,
  SURVEY_REQUIRED_MESSAGE,
  SURVEY_WRONG_COUNT_MESSAGE,
} from "#src/services/runner/constants";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage.test";
import { surveyMatrixDynamicNodeType } from "#src/services/surveyMatrixDynamicNodeType";
import { describe, expect, test } from "vitest";

const createMatrixDynamicNode = (): SurveyMatrixDynamicNode => ({
  props: {
    ...surveyMatrixDynamicNodeType.createDefaultProps(),
    columns: [
      { cellType: SurveyMatrixCellType.Text, choices: [], isRequired: true, name: "a", title: "" },
      { cellType: SurveyMatrixCellType.Boolean, choices: [], isRequired: false, name: "b", title: "" },
    ],
    id: crypto.randomUUID(),
    maxRowCount: 2,
    minRowCount: 1,
  },
  type: SurveyNodeType.MatrixDynamic,
});

describe(createSurveyMatrixDynamicAnswerSchema, () => {
  test("accepts rows within the bounds its owner sets", () => {
    expect.hasAssertions();

    const result = createSurveyMatrixDynamicAnswerSchema(createMatrixDynamicNode()).safeParse([{ a: "a" }]);

    expect(result.success).toBe(true);
  });

  test("refuses fewer rows than its owner's minimum", () => {
    expect.hasAssertions();

    const result = createSurveyMatrixDynamicAnswerSchema(createMatrixDynamicNode()).safeParse([]);

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_WRONG_COUNT_MESSAGE);
  });

  test("refuses a required cell left empty", () => {
    expect.hasAssertions();

    const result = createSurveyMatrixDynamicAnswerSchema(createMatrixDynamicNode()).safeParse([{ a: "" }]);

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_REQUIRED_MESSAGE);
  });

  test("refuses a row keyed by a column its question does not have", () => {
    expect.hasAssertions();

    const result = createSurveyMatrixDynamicAnswerSchema(createMatrixDynamicNode()).safeParse([{ a: "a", c: true }]);

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_INVALID_ANSWER_MESSAGE);
  });
});
