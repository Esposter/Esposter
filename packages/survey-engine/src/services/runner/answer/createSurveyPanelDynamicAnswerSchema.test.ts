import type { SurveyPanelDynamicNode } from "#src/models/SurveyPanelDynamicNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { SurveyTextInputType } from "#src/models/SurveyTextInputType";
import { createSurveyPanelDynamicAnswerSchema } from "#src/services/runner/answer/createSurveyPanelDynamicAnswerSchema";
import {
  SURVEY_INVALID_ANSWER_MESSAGE,
  SURVEY_TOO_LONG_MESSAGE,
  SURVEY_WRONG_COUNT_MESSAGE,
} from "#src/services/runner/constants";
import { createSurveyAnswerSchema } from "#src/services/runner/createSurveyAnswerSchema";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage.test";
import { surveyPanelDynamicNodeType } from "#src/services/surveyPanelDynamicNodeType";
import { surveyTextNodeType } from "#src/services/surveyTextNodeType";
import { describe, expect, test } from "vitest";

const createPanelDynamicNode = (): SurveyPanelDynamicNode => ({
  props: {
    ...surveyPanelDynamicNodeType.createDefaultProps(),
    id: crypto.randomUUID(),
    maxPanelCount: 2,
    minPanelCount: 1,
    template: [
      {
        props: {
          ...surveyTextNodeType.createDefaultProps(),
          id: crypto.randomUUID(),
          inputType: SurveyTextInputType.Text,
          maxLength: 1,
          name: "a",
        },
        type: SurveyNodeType.Text,
      },
    ],
  },
  type: SurveyNodeType.PanelDynamic,
});
const createSchema = () => createSurveyPanelDynamicAnswerSchema(createPanelDynamicNode(), createSurveyAnswerSchema);

describe(createSurveyPanelDynamicAnswerSchema, () => {
  test("accepts panels within the bounds its owner sets, each answering the template", () => {
    expect.hasAssertions();

    const result = createSchema().safeParse([{ a: "b" }]);

    expect(result.success).toBe(true);
  });

  test("refuses a panel whose answer its template question refuses", () => {
    expect.hasAssertions();

    const result = createSchema().safeParse([{ a: "bc" }]);

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_TOO_LONG_MESSAGE);
  });

  test("refuses fewer panels than its owner's minimum", () => {
    expect.hasAssertions();

    const result = createSchema().safeParse([]);

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_WRONG_COUNT_MESSAGE);
  });

  test("refuses a panel keyed by a name its template does not declare", () => {
    expect.hasAssertions();

    const result = createSchema().safeParse([{ c: "b" }]);

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_INVALID_ANSWER_MESSAGE);
  });
});
