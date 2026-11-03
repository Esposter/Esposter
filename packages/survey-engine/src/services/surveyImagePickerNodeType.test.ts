import type { SurveyImageChoice } from "#src/models/SurveyImageChoice";

import { surveyImagePickerNodeType } from "#src/services/surveyImagePickerNodeType";
import { describe, expect, test } from "vitest";

describe("surveyImagePickerNodeType", () => {
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
