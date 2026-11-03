import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyPage } from "#src/services/runner/createSurveyPage.test";
import { createSurveyRunnerDocument } from "#src/services/runner/createSurveyRunnerDocument.test";
import { getSurveyPageViews } from "#src/services/runner/getSurveyPageViews";
import { describe, expect, test } from "vitest";

describe(getSurveyPageViews, () => {
  const now = new Date(0);

  test("an index that names no page has no views", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([createSurveyPage([])]);

    expect(getSurveyPageViews(document, 1, {}, now)).toStrictEqual([]);
  });

  test("a hidden page has no views", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([{ props: { id: "a", name: "a" }, type: SurveyNodeType.Text }], "{x} = 'x'"),
    ]);

    expect(getSurveyPageViews(document, 0, {}, now)).toStrictEqual([]);
  });

  test("a visible page's views name each element by its pointer under the page", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([{ props: { id: "a", name: "a" }, type: SurveyNodeType.Text }]),
    ]);

    expect(getSurveyPageViews(document, 0, {}, now).map(({ pointer }) => pointer)).toStrictEqual([
      "/content/0/props/children/0",
    ]);
  });
});
