import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyPage } from "#src/services/runner/createSurveyPage.test";
import { createSurveyRunnerDocument } from "#src/services/runner/createSurveyRunnerDocument.test";
import { getSurveyExpressionNodes } from "#src/services/runner/getSurveyExpressionNodes";
import { describe, expect, test } from "vitest";

describe(getSurveyExpressionNodes, () => {
  test("a calculated-value question on a page or in a panel is listed in document order", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([
        { props: { expression: "{x}", id: "a", name: "a" }, type: SurveyNodeType.Expression },
        {
          props: {
            children: [{ props: { expression: "{x}", id: "b", name: "b" }, type: SurveyNodeType.Expression }],
            id: crypto.randomUUID(),
          },
          type: SurveyNodeType.Panel,
        },
      ]),
      createSurveyPage([{ props: { expression: "{x}", id: "c", name: "c" }, type: SurveyNodeType.Expression }]),
    ]);

    expect(getSurveyExpressionNodes(document).map(({ props }) => props.name)).toStrictEqual(["a", "b", "c"]);
  });

  test("a dynamic panel's template is not listed, since its questions are computed per panel", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([
        {
          props: {
            id: "b",
            name: "b",
            template: [{ props: { expression: "{x}", id: "a", name: "a" }, type: SurveyNodeType.Expression }],
          },
          type: SurveyNodeType.PanelDynamic,
        },
      ]),
    ]);

    expect(getSurveyExpressionNodes(document)).toStrictEqual([]);
  });
});
