import type { SurveyImageChoice } from "#src/models/SurveyImageChoice";

import { surveyIdSchema } from "#src/services/surveyIdSchema";
import { surveyImagePickerNodeType } from "#src/services/surveyImagePickerNodeType";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("surveyImagePickerNodeType", () => {
  test("an image picker made from the default props parses once its id is added", () => {
    expect.hasAssertions();

    const nodeSchema = z.strictObject({ ...surveyImagePickerNodeType.propsSchema.shape, id: surveyIdSchema });
    const result = nodeSchema.safeParse({ ...surveyImagePickerNodeType.createDefaultProps(), id: crypto.randomUUID() });

    expect(result.success).toBe(true);
  });

  test("an image picker refuses two choices that share a value, whatever their texts", () => {
    expect.hasAssertions();

    const choices: SurveyImageChoice[] = [
      { imageLink: " ", text: "", value: "" },
      { imageLink: " ", text: " ", value: "" },
    ];
    const result = surveyImagePickerNodeType.propsSchema.safeParse({
      ...surveyImagePickerNodeType.createDefaultProps(),
      choices,
    });

    expect(result.success).toBe(false);
  });
});
