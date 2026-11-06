import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyPage } from "#src/services/runner/createSurveyPage.test";
import { createSurveyRunnerDocument } from "#src/services/runner/createSurveyRunnerDocument.test";
import { createSurveyRunnerState } from "#src/services/runner/createSurveyRunnerState";
import { getSurveyProgress } from "#src/services/runner/getSurveyProgress";
import { describe, expect, test } from "vitest";

describe(getSurveyProgress, () => {
  const now = new Date(0);
  const document = createSurveyRunnerDocument([
    createSurveyPage([{ props: { id: "a", name: "a" }, type: SurveyNodeType.Text }]),
    createSurveyPage([{ props: { id: "b", name: "b" }, type: SurveyNodeType.Text }], "{x} = 'x'"),
    createSurveyPage([{ props: { id: "c", name: "c" }, type: SurveyNodeType.Text }]),
  ]);

  test("the position counts the shown pages up to the current one, out of the shown total", () => {
    expect.hasAssertions();

    expect(getSurveyProgress(document, createSurveyRunnerState(document, {}, 2), now)).toStrictEqual({
      current: 2,
      total: 2,
    });
  });

  test("a hidden current page counts the shown pages before it", () => {
    expect.hasAssertions();

    expect(getSurveyProgress(document, createSurveyRunnerState(document, {}, 1), now)).toStrictEqual({
      current: 1,
      total: 2,
    });
  });
});
