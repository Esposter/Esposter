import type { SurveyMultipleTextItem } from "#src/models/SurveyMultipleTextItem";

import { SurveyMultipleTextItemInputType } from "#src/models/SurveyMultipleTextItemInputType";
import { surveyIdSchema } from "#src/services/surveyIdSchema";
import { surveyMultipleTextNodeType } from "#src/services/surveyMultipleTextNodeType";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("surveyMultipleTextNodeType", () => {
  test("a multiple text question made from the default props parses once its id is added", () => {
    expect.hasAssertions();

    const nodeSchema = z.strictObject({ ...surveyMultipleTextNodeType.propsSchema.shape, id: surveyIdSchema });
    const result = nodeSchema.safeParse({
      ...surveyMultipleTextNodeType.createDefaultProps(),
      id: crypto.randomUUID(),
    });

    expect(result.success).toBe(true);
  });

  test("a multiple text question refuses two items that share a name, whatever their titles", () => {
    expect.hasAssertions();

    const items: SurveyMultipleTextItem[] = [
      { inputType: SurveyMultipleTextItemInputType.Text, isRequired: false, name: " ", title: "" },
      { inputType: SurveyMultipleTextItemInputType.Text, isRequired: false, name: " ", title: " " },
    ];
    const result = surveyMultipleTextNodeType.propsSchema.safeParse({
      ...surveyMultipleTextNodeType.createDefaultProps(),
      items,
    });

    expect(result.success).toBe(false);
  });
});
