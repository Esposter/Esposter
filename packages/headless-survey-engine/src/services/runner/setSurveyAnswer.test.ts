import type { SurveyRunnerState } from "#src/models/SurveyRunnerState";

import { setSurveyAnswer } from "#src/services/runner/setSurveyAnswer";
import { describe, expect, test } from "vitest";

describe(setSurveyAnswer, () => {
  const state: SurveyRunnerState = { answers: { a: "a" }, isCompleted: false, pageIndex: 0 };

  test("an answer is set beside the others", () => {
    expect.hasAssertions();

    expect(setSurveyAnswer(state, "b", "b").answers).toStrictEqual({ a: "a", b: "b" });
  });

  test("an answer is replaced by a new one", () => {
    expect.hasAssertions();

    expect(setSurveyAnswer(state, "a", "b").answers).toStrictEqual({ a: "b" });
  });

  test.each([
    ["no value", undefined],
    ["an empty text", ""],
    ["an empty list", []],
  ])("%s removes the answer", (_name, value) => {
    expect.hasAssertions();

    expect(setSurveyAnswer(state, "a", value).answers).toStrictEqual({});
  });

  test("the given state is left as it was", () => {
    expect.hasAssertions();

    setSurveyAnswer(state, "a", undefined);

    expect(state.answers).toStrictEqual({ a: "a" });
  });
});
