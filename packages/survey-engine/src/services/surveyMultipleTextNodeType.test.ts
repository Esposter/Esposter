import type { SurveyMultipleTextItem } from "#src/models/SurveyMultipleTextItem";

import { SurveyMultipleTextItemInputType } from "#src/models/SurveyMultipleTextItemInputType";
import { surveyMultipleTextNodeType } from "#src/services/surveyMultipleTextNodeType";
import { describe, expect, test } from "vitest";

describe("surveyMultipleTextNodeType", () => {
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
