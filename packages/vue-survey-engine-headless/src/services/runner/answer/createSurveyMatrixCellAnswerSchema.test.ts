import type { SurveyMatrixColumn } from "#src/models/SurveyMatrixColumn";

import { SurveyMatrixCellType } from "#src/models/SurveyMatrixCellType";
import { createSurveyMatrixCellAnswerSchema } from "#src/services/runner/answer/createSurveyMatrixCellAnswerSchema";
import { SURVEY_NOT_A_CHOICE_MESSAGE, SURVEY_OUT_OF_RANGE_MESSAGE } from "#src/services/runner/constants";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage";
import { describe, expect, test } from "vitest";

describe(createSurveyMatrixCellAnswerSchema, () => {
  const choices = [{ text: "", value: "a" }];

  const createColumn = (cellType: SurveyMatrixCellType): SurveyMatrixColumn => ({
    cellType,
    choices,
    isRequired: false,
    name: "name",
    title: "",
  });

  test("accepts a dropdown cell holding one of its column's choices", () => {
    expect.hasAssertions();

    const result = createSurveyMatrixCellAnswerSchema(createColumn(SurveyMatrixCellType.Dropdown)).safeParse("a");

    expect(result.success).toBe(true);
  });

  test("refuses a dropdown cell holding a value its column does not offer", () => {
    expect.hasAssertions();

    const result = createSurveyMatrixCellAnswerSchema(createColumn(SurveyMatrixCellType.Dropdown)).safeParse("b");

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_NOT_A_CHOICE_MESSAGE);
  });

  test("accepts a checkbox cell holding a list of its column's choices", () => {
    expect.hasAssertions();

    const result = createSurveyMatrixCellAnswerSchema(createColumn(SurveyMatrixCellType.Checkbox)).safeParse(["a"]);

    expect(result.success).toBe(true);
  });

  test("refuses a rating cell above five", () => {
    expect.hasAssertions();

    const result = createSurveyMatrixCellAnswerSchema(createColumn(SurveyMatrixCellType.Rating)).safeParse(6);

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_OUT_OF_RANGE_MESSAGE);
  });
});
