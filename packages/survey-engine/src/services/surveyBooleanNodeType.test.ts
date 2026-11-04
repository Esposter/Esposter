import { SurveyBooleanDisplayStyle } from "#src/models/SurveyBooleanDisplayStyle";
import { surveyBooleanNodeType } from "#src/services/surveyBooleanNodeType";
import { describe, expect, test } from "vitest";

describe("surveyBooleanNodeType", () => {
  test("a yes or no question offers its display styles in the order the form lists them", () => {
    expect.hasAssertions();

    expect(surveyBooleanNodeType.propsSchema.shape.displayStyle.unwrap().options).toStrictEqual([
      SurveyBooleanDisplayStyle.Switch,
      SurveyBooleanDisplayStyle.Checkbox,
      SurveyBooleanDisplayStyle.Radio,
    ]);
  });

  test("a yes or no question offers every display style, each once", () => {
    expect.hasAssertions();

    expect(surveyBooleanNodeType.propsSchema.shape.displayStyle.unwrap().options.toSorted()).toStrictEqual(
      Object.values(SurveyBooleanDisplayStyle).toSorted(),
    );
  });
});
