import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyPage } from "#src/services/runner/createSurveyPage.test";
import { createSurveyRunnerDocument } from "#src/services/runner/createSurveyRunnerDocument.test";
import { getSurveyRunnerValues } from "#src/services/runner/getSurveyRunnerValues";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getSurveyRunnerValues, () => {
  const now = new Date(0);

  test("an answer reads as its value, a list and a record included", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([]);

    expect(getSurveyRunnerValues(document, { a: "a", b: [0], c: { a: true } }, now)).toStrictEqual({
      a: "a",
      b: [0],
      c: { a: true },
    });
  });

  test("a calculated value is computed from the answers", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([], [{ expression: "{a} = 'a'", name: "b" }]);

    expect(getSurveyRunnerValues(document, { a: "a" }, now)).toStrictEqual({ a: "a", b: true });
  });

  test("a calculated-value question is computed from the answers, inside a panel too", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([
        {
          props: {
            children: [{ props: { expression: "{a}", id: "b", name: "b" }, type: SurveyNodeType.Expression }],
            id: v7(),
          },
          type: SurveyNodeType.Panel,
        },
      ]),
    ]);

    expect(getSurveyRunnerValues(document, { a: "a" }, now)).toStrictEqual({ a: "a", b: "a" });
  });

  test("a dynamic panel's template is not computed at the top level", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([
        {
          props: {
            id: "b",
            name: "b",
            template: [{ props: { expression: "{a}", id: "c", name: "c" }, type: SurveyNodeType.Expression }],
          },
          type: SurveyNodeType.PanelDynamic,
        },
      ]),
    ]);

    expect(getSurveyRunnerValues(document, { a: "a" }, now)).toStrictEqual({ a: "a" });
  });

  test("a calculated value that reads an earlier one settles in the same pass", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument(
      [],
      [
        { expression: "{a}", name: "b" },
        { expression: "{b}", name: "c" },
      ],
    );

    expect(getSurveyRunnerValues(document, { a: "a" }, now)).toStrictEqual({ a: "a", b: "a", c: "a" });
  });

  test("a calculated value that reads a later one settles within the passes allowed", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument(
      [],
      [
        { expression: "{b}", name: "c" },
        { expression: "{d}", name: "b" },
        { expression: "{a}", name: "d" },
      ],
    );

    expect(getSurveyRunnerValues(document, { a: "a" }, now)).toStrictEqual({ a: "a", b: "a", c: "a", d: "a" });
  });

  test("a calculated value never overwrites an answer", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([], [{ expression: "{a}", name: "b" }]);

    expect(getSurveyRunnerValues(document, { a: "a", b: "b" }, now)).toStrictEqual({ a: "a", b: "b" });
  });

  test("a calculated value that errors is left out", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([], [{ expression: "({a}", name: "b" }]);

    expect(getSurveyRunnerValues(document, { a: "a" }, now)).toStrictEqual({ a: "a" });
  });

  test("a calculated value that does not settle is left out, and a settled one stays", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument(
      [],
      [
        { expression: "{a}", name: "b" },
        { expression: "not {c}", name: "c" },
      ],
    );

    expect(getSurveyRunnerValues(document, { a: "a" }, now)).toStrictEqual({ a: "a", b: "a" });
  });
});
