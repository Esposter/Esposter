import { toSurveyMultipleTextItemFromText } from "@/services/resource/survey/toSurveyMultipleTextItemFromText";
import { SurveyMultipleTextItemInputType } from "headless-survey-engine";
import { describe, expect, test } from "vitest";

describe("toSurveyMultipleTextItemFromText", () => {
  test("blank text makes no item", () => {
    expect.hasAssertions();
    expect(toSurveyMultipleTextItemFromText("")).toBeUndefined();
  });

  test("a typed name makes a text item named and titled by the name, trimmed", () => {
    expect.hasAssertions();
    expect(toSurveyMultipleTextItemFromText(" Email ")).toStrictEqual({
      inputType: SurveyMultipleTextItemInputType.Text,
      isRequired: false,
      name: "Email",
      title: "Email",
    });
  });
});
