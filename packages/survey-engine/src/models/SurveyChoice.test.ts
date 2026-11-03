import { surveyChoiceSchema } from "#src/models/SurveyChoice";
import { describe, expect, test } from "vitest";

describe("surveyChoiceSchema", () => {
  test("a choice whose value is a number parses", () => {
    expect.hasAssertions();

    expect(surveyChoiceSchema.parse({ value: 0 })).toStrictEqual({ value: 0 });
  });
});
