import type { SurveyImageChoice } from "#src/models/SurveyImageChoice";

import { MAX_SURVEY_IMAGE_SIZE } from "#src/services/constants";
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

  test("an image picker refuses a picture drawn larger than the largest size", () => {
    expect.hasAssertions();

    const result = surveyImagePickerNodeType.propsSchema.safeParse({
      ...surveyImagePickerNodeType.createDefaultProps(),
      imageWidth: MAX_SURVEY_IMAGE_SIZE + 1,
    });

    expect(result.success).toBe(false);
  });
});
