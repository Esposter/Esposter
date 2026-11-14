import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyPage } from "#src/services/runner/createSurveyPage.test";
import { createSurveyRunnerDocument } from "#src/services/runner/createSurveyRunnerDocument.test";
import { getSurveyVisiblePageIndexes } from "#src/services/runner/getSurveyVisiblePageIndexes";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getSurveyVisiblePageIndexes, () => {
  const now = new Date(0);

  test("a page whose condition does not hold is not visible", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([{ props: { id: "a", name: "a" }, type: SurveyNodeType.Text }]),
      createSurveyPage([{ props: { id: "b", name: "b" }, type: SurveyNodeType.Text }], "{x} = 'x'"),
    ]);

    expect(getSurveyVisiblePageIndexes(document, {}, now)).toStrictEqual([0]);
  });

  test("a page whose only element is hidden is not visible", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([{ props: { id: "a", name: "a", visibleIf: "{x} = 'x'" }, type: SurveyNodeType.Text }]),
    ]);

    expect(getSurveyVisiblePageIndexes(document, {}, now)).toStrictEqual([]);
  });

  test("a page whose only panel holds nothing shown is not visible", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([
        {
          props: {
            children: [{ props: { id: "a", name: "a", visibleIf: "{x} = 'x'" }, type: SurveyNodeType.Text }],
            id: v7(),
          },
          type: SurveyNodeType.Panel,
        },
      ]),
    ]);

    expect(getSurveyVisiblePageIndexes(document, {}, now)).toStrictEqual([]);
  });
});
