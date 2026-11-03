import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { SURVEY_REQUIRED_MESSAGE } from "#src/services/runner/constants";
import { createSurveyPage } from "#src/services/runner/createSurveyPage.test";
import { createSurveyRunnerDocument } from "#src/services/runner/createSurveyRunnerDocument.test";
import { createSurveyRunnerState } from "#src/services/runner/createSurveyRunnerState";
import { goToNextSurveyPage } from "#src/services/runner/goToNextSurveyPage";
import { describe, expect, test } from "vitest";

describe(goToNextSurveyPage, () => {
  const now = new Date(0);

  test("a required question left empty refuses the move and keeps the same state", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([
        { props: { id: "a", isRequired: true, name: "a" }, type: SurveyNodeType.Text },
        { props: { id: "b", isRequired: true, name: "b" }, type: SurveyNodeType.Text },
      ]),
      createSurveyPage([{ props: { id: "c", name: "c" }, type: SurveyNodeType.Text }]),
    ]);
    const state = createSurveyRunnerState(document, {}, 0);

    const move = goToNextSurveyPage(document, state, now);

    expect(move.state).toBe(state);
    expect(move.errors.map(({ message, name }) => ({ message, name }))).toStrictEqual([
      { message: SURVEY_REQUIRED_MESSAGE, name: "a" },
      { message: SURVEY_REQUIRED_MESSAGE, name: "b" },
    ]);
  });

  test("a required question that is hidden does not block the move", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([
        { props: { id: "a", isRequired: true, name: "a", visibleIf: "{x} = 'x'" }, type: SurveyNodeType.Text },
      ]),
      createSurveyPage([{ props: { id: "b", name: "b" }, type: SurveyNodeType.Text }]),
    ]);

    const move = goToNextSurveyPage(document, createSurveyRunnerState(document, {}, 0), now);

    expect(move.errors).toStrictEqual([]);
    expect(move.state.pageIndex).toBe(1);
  });

  test("a page hidden by a condition is skipped", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([{ props: { id: "a", name: "a" }, type: SurveyNodeType.Text }]),
      createSurveyPage([{ props: { id: "b", name: "b" }, type: SurveyNodeType.Text }], "{a} = 'yes'"),
      createSurveyPage([{ props: { id: "c", name: "c" }, type: SurveyNodeType.Text }]),
    ]);

    const move = goToNextSurveyPage(document, createSurveyRunnerState(document, {}, 0), now);

    expect(move.state.pageIndex).toBe(2);
  });

  test("the last page keeps the same state", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([{ props: { id: "a", name: "a" }, type: SurveyNodeType.Text }]),
    ]);
    const state = createSurveyRunnerState(document, {}, 0);

    expect(goToNextSurveyPage(document, state, now).state).toBe(state);
  });
});
