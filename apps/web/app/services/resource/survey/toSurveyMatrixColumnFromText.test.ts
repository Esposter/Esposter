import { toSurveyMatrixColumnFromText } from "@/services/resource/survey/toSurveyMatrixColumnFromText";
import { SurveyMatrixCellType } from "survey-engine";
import { describe, expect, test } from "vitest";

describe("toSurveyMatrixColumnFromText", () => {
  test("blank text makes no column", () => {
    expect.hasAssertions();
    expect(toSurveyMatrixColumnFromText("  ")).toBeUndefined();
  });

  test("a typed title makes a text column named and titled by the title, trimmed", () => {
    expect.hasAssertions();
    expect(toSurveyMatrixColumnFromText(" Rating ")).toStrictEqual({
      cellType: SurveyMatrixCellType.Text,
      choices: [],
      isRequired: false,
      name: "Rating",
      title: "Rating",
    });
  });
});
