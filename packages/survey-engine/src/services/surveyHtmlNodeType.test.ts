import { surveyHtmlNodeType } from "#src/services/surveyHtmlNodeType";
import { describe, expect, test } from "vitest";

describe("surveyHtmlNodeType", () => {
  test("a text block keeps its markup as written, script tags included, since the sanitiser runs where it renders", () => {
    expect.hasAssertions();

    const html = "<script></script>";
    const result = surveyHtmlNodeType.propsSchema.parse({ ...surveyHtmlNodeType.createDefaultProps(), html });

    expect(result.html).toBe(html);
  });
});
