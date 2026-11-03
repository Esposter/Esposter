import { withSurveyAnswer } from "@/services/resource/survey/withSurveyAnswer";
import { describe, expect, test } from "vitest";

describe("withSurveyAnswer", () => {
  test("sets an answer beside the others in its row", () => {
    expect.hasAssertions();

    expect(withSurveyAnswer({ a: "" }, "b", "c")).toStrictEqual({ a: "", b: "c" });
  });

  test("clears an absent answer without leaving its key behind", () => {
    expect.hasAssertions();

    expect(withSurveyAnswer({ a: "b" }, "a", undefined)).toStrictEqual({});
  });
});
