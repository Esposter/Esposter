import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyPage } from "#src/services/runner/createSurveyPage.test";
import { createSurveyRunnerDocument } from "#src/services/runner/createSurveyRunnerDocument.test";
import { createSurveyRunnerState } from "#src/services/runner/createSurveyRunnerState";
import { isLastSurveyPage } from "#src/services/runner/isLastSurveyPage";
import { describe, expect, test } from "vitest";

describe(isLastSurveyPage, () => {
  const now = new Date(0);
  const document = createSurveyRunnerDocument([
    createSurveyPage([{ props: { id: "a", name: "a" }, type: SurveyNodeType.Text }]),
    createSurveyPage([{ props: { id: "b", name: "b" }, type: SurveyNodeType.Text }]),
    createSurveyPage([{ props: { id: "c", name: "c" }, type: SurveyNodeType.Text }], "{x} = 'x'"),
  ]);

  test("the last shown page is the last one even when a hidden page follows it", () => {
    expect.hasAssertions();

    expect(isLastSurveyPage(document, createSurveyRunnerState(document, {}, 1), now)).toBe(true);
  });

  test("a page with a shown page after it is not the last", () => {
    expect.hasAssertions();

    expect(isLastSurveyPage(document, createSurveyRunnerState(document, {}, 0), now)).toBe(false);
  });
});
