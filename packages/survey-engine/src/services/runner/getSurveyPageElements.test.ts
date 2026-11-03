import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyPage } from "#src/services/runner/createSurveyPage.test";
import { createSurveyRunnerDocument } from "#src/services/runner/createSurveyRunnerDocument.test";
import { createSurveyRunnerState } from "#src/services/runner/createSurveyRunnerState";
import { getSurveyPageElements } from "#src/services/runner/getSurveyPageElements";
import { setSurveyAnswer } from "#src/services/runner/setSurveyAnswer";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getSurveyPageElements, () => {
  const now = new Date(0);

  test("an answer reveals a follow-up question, and answering again hides it", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([
        { props: { id: "a", name: "a" }, type: SurveyNodeType.Text },
        { props: { id: "b", name: "b", visibleIf: "{a} = 'yes'" }, type: SurveyNodeType.Text },
      ]),
    ]);
    const shownPointers = (answers: Record<string, string>) =>
      getSurveyPageElements(document, createSurveyRunnerState(document, answers, 0), now).map(({ pointer }) => pointer);

    expect(shownPointers({})).toStrictEqual(["/content/0/props/children/0"]);
    expect(shownPointers({ a: "yes" })).toStrictEqual(["/content/0/props/children/0", "/content/0/props/children/1"]);
    expect(shownPointers({ a: "no" })).toStrictEqual(["/content/0/props/children/0"]);
  });

  test("a hidden page has no elements", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([{ props: { id: "a", name: "a" }, type: SurveyNodeType.Text }], "{x} = 'x'"),
    ]);

    expect(getSurveyPageElements(document, createSurveyRunnerState(document, {}, 0), now)).toStrictEqual([]);
  });

  test("the elements are those of the state's current page only", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([{ props: { id: "a", name: "a" }, type: SurveyNodeType.Text }]),
      createSurveyPage([{ props: { id: "b", name: "b" }, type: SurveyNodeType.Text }]),
    ]);

    const views = getSurveyPageElements(document, createSurveyRunnerState(document, {}, 1), now);

    expect(views.map(({ pointer }) => pointer)).toStrictEqual(["/content/1/props/children/0"]);
  });

  test("a calculated-value question is shown but never enabled", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([{ props: { expression: "{a}", id: "b", name: "b" }, type: SurveyNodeType.Expression }]),
    ]);

    const state = setSurveyAnswer(createSurveyRunnerState(document, {}, 0), "a", "a");

    expect(takeOne(getSurveyPageElements(document, state, now), 0).isEnabled).toBe(false);
  });
});
