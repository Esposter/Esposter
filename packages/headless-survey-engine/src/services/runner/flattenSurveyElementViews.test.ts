import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyPage } from "#src/services/runner/createSurveyPage.test";
import { createSurveyRunnerDocument } from "#src/services/runner/createSurveyRunnerDocument.test";
import { flattenSurveyElementViews } from "#src/services/runner/flattenSurveyElementViews";
import { getSurveyPageViews } from "#src/services/runner/getSurveyPageViews";
import { describe, expect, test } from "vitest";

describe(flattenSurveyElementViews, () => {
  test("a panel's view comes before the views it holds, and the views after it follow", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([
        {
          props: { children: [{ props: { id: "a", name: "a" }, type: SurveyNodeType.Text }], id: crypto.randomUUID() },
          type: SurveyNodeType.Panel,
        },
        { props: { id: "b", name: "b" }, type: SurveyNodeType.Text },
      ]),
    ]);

    const views = flattenSurveyElementViews(getSurveyPageViews(document, 0, {}, new Date(0)));

    expect(views.map(({ pointer }) => pointer)).toStrictEqual([
      "/content/0/props/children/0",
      "/content/0/props/children/0/props/children/0",
      "/content/0/props/children/1",
    ]);
  });
});
