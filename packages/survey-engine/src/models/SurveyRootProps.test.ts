import { SurveyProgressBarPlacement } from "#src/models/SurveyProgressBarPlacement";
import { surveyRootPropsSchema } from "#src/models/SurveyRootProps";
import { describe, expect, test } from "vitest";

describe("surveyRootPropsSchema", () => {
  test("a survey's root props default to no texts, no colours, no progress bar and no calculated values", () => {
    expect.hasAssertions();

    expect(surveyRootPropsSchema.parse({})).toStrictEqual({
      accentColor: "",
      backgroundColor: "",
      calculatedValues: [],
      completedHtml: "",
      completeText: "",
      description: "",
      logo: "",
      pageNextText: "",
      pagePrevText: "",
      showProgressBar: SurveyProgressBarPlacement.Off,
      showQuestionNumbers: false,
      title: "",
    });
  });
});
