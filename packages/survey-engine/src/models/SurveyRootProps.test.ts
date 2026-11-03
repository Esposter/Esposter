import { SurveyProgressBarPlacement } from "#src/models/SurveyProgressBarPlacement";
import { surveyRootPropsSchema } from "#src/models/SurveyRootProps";
import { describe, expect, test } from "vitest";

describe("surveyRootPropsSchema", () => {
  test("a survey's root props default to no progress bar, no question numbers and no calculated values", () => {
    expect.hasAssertions();

    expect(surveyRootPropsSchema.parse({})).toStrictEqual({
      calculatedValues: [],
      showProgressBar: SurveyProgressBarPlacement.Off,
      showQuestionNumbers: false,
    });
  });

  test("an accent colour that is not six hex digits is refused", () => {
    expect.hasAssertions();

    const result = surveyRootPropsSchema.safeParse({ accentColor: "#fff" });

    expect(result.error?.issues.map(({ path }) => path)).toStrictEqual([["accentColor"]]);
  });
});
