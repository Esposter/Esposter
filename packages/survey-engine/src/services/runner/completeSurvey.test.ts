import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { SURVEY_REQUIRED_MESSAGE } from "#src/services/runner/constants";
import { completeSurvey } from "#src/services/runner/completeSurvey";
import { createSurveyPage } from "#src/services/runner/createSurveyPage.test";
import { createSurveyRunnerDocument } from "#src/services/runner/createSurveyRunnerDocument.test";
import { createSurveyRunnerState } from "#src/services/runner/createSurveyRunnerState";
import { setSurveyAnswer } from "#src/services/runner/setSurveyAnswer";
import { describe, expect, test } from "vitest";

describe(completeSurvey, () => {
  const now = new Date(0);

  test("a hidden question's earlier answer is dropped on completion", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([
        { props: { id: "a", name: "a" }, type: SurveyNodeType.Text },
        { props: { id: "b", name: "b", visibleIf: "{a} = 'yes'" }, type: SurveyNodeType.Text },
      ]),
    ]);
    const answered = setSurveyAnswer(setSurveyAnswer(createSurveyRunnerState(document, {}, 0), "a", "yes"), "b", "b");

    const completion = completeSurvey(document, setSurveyAnswer(answered, "a", "no"), now);

    expect(completion.answers).toStrictEqual({ a: "no" });
    expect(completion.state.isCompleted).toBe(true);
  });

  test("the first page with errors is returned, and the state moves to it unfinished", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([{ props: { id: "a", name: "a" }, type: SurveyNodeType.Text }]),
      createSurveyPage([{ props: { id: "b", isRequired: true, name: "b" }, type: SurveyNodeType.Text }]),
    ]);

    const completion = completeSurvey(document, createSurveyRunnerState(document, {}, 0), now);

    expect(completion.errors).toStrictEqual([
      { message: SURVEY_REQUIRED_MESSAGE, name: "b", pointer: "/content/1/props/children/0" },
    ]);
    expect(completion.state).toStrictEqual({ answers: {}, isCompleted: false, pageIndex: 1 });
    expect(completion.answers).toStrictEqual({});
  });

  test("a hidden page is not validated", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([{ props: { id: "a", name: "a" }, type: SurveyNodeType.Text }]),
      createSurveyPage([{ props: { id: "b", isRequired: true, name: "b" }, type: SurveyNodeType.Text }], "{x} = 'x'"),
    ]);

    expect(completeSurvey(document, createSurveyRunnerState(document, {}, 0), now).errors).toStrictEqual([]);
  });

  test("the result holds each calculated value flagged for it and each visible calculated-value question", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument(
      [
        createSurveyPage([
          { props: { id: "a", name: "a" }, type: SurveyNodeType.Text },
          { props: { expression: "{a}", id: "b", name: "b" }, type: SurveyNodeType.Expression },
        ]),
      ],
      [
        { expression: "{a}", includeIntoResult: true, name: "c" },
        { expression: "{a}", includeIntoResult: false, name: "d" },
      ],
    );

    const completion = completeSurvey(
      document,
      setSurveyAnswer(createSurveyRunnerState(document, {}, 0), "a", "a"),
      now,
    );

    expect(completion.answers).toStrictEqual({ a: "a", b: "a", c: "a" });
  });

  test("a calculated value reads only the answers the result keeps", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument(
      [
        createSurveyPage([
          { props: { id: "a", name: "a" }, type: SurveyNodeType.Text },
          { props: { id: "b", name: "b", visibleIf: "{a} = 'yes'" }, type: SurveyNodeType.Text },
        ]),
      ],
      [{ expression: "{b}", includeIntoResult: true, name: "c" }],
    );
    const answered = setSurveyAnswer(setSurveyAnswer(createSurveyRunnerState(document, {}, 0), "b", "b"), "a", "no");

    expect(completeSurvey(document, answered, now).answers).toStrictEqual({ a: "no" });
  });
});
