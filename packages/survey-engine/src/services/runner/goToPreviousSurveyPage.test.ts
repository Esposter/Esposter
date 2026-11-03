import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyPage } from "#src/services/runner/createSurveyPage.test";
import { createSurveyRunnerDocument } from "#src/services/runner/createSurveyRunnerDocument.test";
import { createSurveyRunnerState } from "#src/services/runner/createSurveyRunnerState";
import { goToPreviousSurveyPage } from "#src/services/runner/goToPreviousSurveyPage";
import { describe, expect, test } from "vitest";

describe(goToPreviousSurveyPage, () => {
  const now = new Date(0);

  test("a move back skips a page hidden by a condition", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([{ props: { id: "a", name: "a" }, type: SurveyNodeType.Text }]),
      createSurveyPage([{ props: { id: "b", name: "b" }, type: SurveyNodeType.Text }], "{x} = 'x'"),
      createSurveyPage([{ props: { id: "c", name: "c" }, type: SurveyNodeType.Text }]),
    ]);

    const state = goToPreviousSurveyPage(document, createSurveyRunnerState(document, {}, 2), now);

    expect(state.pageIndex).toBe(0);
  });

  test("the first page keeps the same state", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([{ props: { id: "a", name: "a" }, type: SurveyNodeType.Text }]),
    ]);
    const state = createSurveyRunnerState(document, {}, 0);

    expect(goToPreviousSurveyPage(document, state, now)).toBe(state);
  });

  test("a move back does not validate the page being left", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([{ props: { id: "a", name: "a" }, type: SurveyNodeType.Text }]),
      createSurveyPage([{ props: { id: "b", isRequired: true, name: "b" }, type: SurveyNodeType.Text }]),
    ]);

    const state = goToPreviousSurveyPage(document, createSurveyRunnerState(document, {}, 1), now);

    expect(state.pageIndex).toBe(0);
  });
});
