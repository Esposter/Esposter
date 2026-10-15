import { surveyResourceSchema } from "#shared/models/resource/survey/SurveyResource";
import { describe, expect, test } from "vitest";

describe("surveyResourceSchema", () => {
  test("accepts a serialized SurveyJS object", () => {
    expect.hasAssertions();

    expect(surveyResourceSchema.safeParse({ model: '{"pages":[]}', settings: {} }).success).toBe(true);
    expect(surveyResourceSchema.safeParse({ model: "", settings: {} }).success).toBe(true);
  });

  test("rejects malformed JSON and non-object JSON models", () => {
    expect.hasAssertions();

    expect(surveyResourceSchema.safeParse({ model: "{", settings: {} }).success).toBe(false);
    expect(surveyResourceSchema.safeParse({ model: "[]", settings: {} }).success).toBe(false);
  });
});
