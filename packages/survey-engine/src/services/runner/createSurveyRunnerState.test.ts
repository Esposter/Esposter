import { createSurveyPage } from "#src/services/runner/createSurveyPage.test";
import { createSurveyRunnerDocument } from "#src/services/runner/createSurveyRunnerDocument.test";
import { createSurveyRunnerState } from "#src/services/runner/createSurveyRunnerState";
import { describe, expect, test } from "vitest";

describe(createSurveyRunnerState, () => {
  const document = createSurveyRunnerDocument([createSurveyPage([]), createSurveyPage([])]);

  test.each([
    ["a page within the document", 1, 1],
    ["a page past the last", 5, 1],
    ["a page before the first", -1, 0],
  ])("%s opens at page %s, clamped", (_name, pageIndex, expected) => {
    expect.hasAssertions();

    expect(createSurveyRunnerState(document, {}, pageIndex).pageIndex).toBe(expected);
  });

  test("an empty survey opens its first page", () => {
    expect.hasAssertions();

    expect(createSurveyRunnerState(createSurveyRunnerDocument([]), {}, 1).pageIndex).toBe(0);
  });

  test("the answers are kept and the survey is not completed", () => {
    expect.hasAssertions();

    expect(createSurveyRunnerState(document, { a: "a" }, 0)).toStrictEqual({
      answers: { a: "a" },
      isCompleted: false,
      pageIndex: 0,
    });
  });
});
