import { surveyHtmlNodeType } from "#src/services/surveyHtmlNodeType";
import { surveyIdSchema } from "#src/services/surveyIdSchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("surveyHtmlNodeType", () => {
  test("a text block made from the default props parses once its id is added", () => {
    expect.hasAssertions();

    const nodeSchema = z.strictObject({ ...surveyHtmlNodeType.propsSchema.shape, id: surveyIdSchema });
    const result = nodeSchema.safeParse({ ...surveyHtmlNodeType.createDefaultProps(), id: crypto.randomUUID() });

    expect(result.success).toBe(true);
  });

  test("a text block keeps its markup as written, script tags included, since the sanitiser runs where it renders", () => {
    expect.hasAssertions();

    const html = "<script></script>";
    const result = surveyHtmlNodeType.propsSchema.parse({ ...surveyHtmlNodeType.createDefaultProps(), html });

    expect(result.html).toBe(html);
  });
});
