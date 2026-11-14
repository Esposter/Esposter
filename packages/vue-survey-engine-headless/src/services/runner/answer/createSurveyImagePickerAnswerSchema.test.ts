import type { SurveyImagePickerNode } from "#src/models/SurveyImagePickerNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyImagePickerAnswerSchema } from "#src/services/runner/answer/createSurveyImagePickerAnswerSchema";
import { SURVEY_NOT_A_CHOICE_MESSAGE } from "#src/services/runner/constants";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage";
import { surveyImagePickerNodeType } from "#src/services/surveyImagePickerNodeType";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

const createImagePickerNode = (multiSelect: boolean): SurveyImagePickerNode => ({
  props: {
    ...surveyImagePickerNodeType.createDefaultProps(),
    choices: [{ imageLink: "", text: "", value: "a" }],
    id: v7(),
    multiSelect,
  },
  type: SurveyNodeType.ImagePicker,
});

describe(createSurveyImagePickerAnswerSchema, () => {
  test("accepts one of its choices when it takes one", () => {
    expect.hasAssertions();

    const result = createSurveyImagePickerAnswerSchema(createImagePickerNode(false)).safeParse("a");

    expect(result.success).toBe(true);
  });

  test("accepts a list of its choices when it takes several", () => {
    expect.hasAssertions();

    const result = createSurveyImagePickerAnswerSchema(createImagePickerNode(true)).safeParse(["a"]);

    expect(result.success).toBe(true);
  });

  test("refuses a list when it takes one choice", () => {
    expect.hasAssertions();

    const result = createSurveyImagePickerAnswerSchema(createImagePickerNode(false)).safeParse(["a"]);

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_NOT_A_CHOICE_MESSAGE);
  });
});
