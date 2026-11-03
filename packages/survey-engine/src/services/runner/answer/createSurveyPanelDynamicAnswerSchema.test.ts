import type { SurveyPanelDynamicNode } from "#src/models/SurveyPanelDynamicNode";
import type { SurveyTemplateNode } from "#src/models/SurveyTemplateNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { SurveyTextInputType } from "#src/models/SurveyTextInputType";
import { createSurveyPanelDynamicAnswerSchema } from "#src/services/runner/answer/createSurveyPanelDynamicAnswerSchema";
import {
  SURVEY_INVALID_ANSWER_MESSAGE,
  SURVEY_REQUIRED_MESSAGE,
  SURVEY_TOO_LONG_MESSAGE,
  SURVEY_WRONG_COUNT_MESSAGE,
} from "#src/services/runner/constants";
import { createSurveyAnswerSchema } from "#src/services/runner/createSurveyAnswerSchema";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage.test";
import { surveyBooleanNodeType } from "#src/services/surveyBooleanNodeType";
import { surveyPanelDynamicNodeType } from "#src/services/surveyPanelDynamicNodeType";
import { surveyTextNodeType } from "#src/services/surveyTextNodeType";
import { describe, expect, test } from "vitest";

const createPanelDynamicNode = (isRequired = false): SurveyPanelDynamicNode => ({
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
          isRequired,
          maxLength: 1,
          name: "a",
        },
        type: SurveyNodeType.Text,
      },
    ],
  },
  type: SurveyNodeType.PanelDynamic,
});
// A template whose required question "b" is shown only in a row whose boolean question "a" is yes
const createGatedPanelDynamicNode = (): SurveyPanelDynamicNode => ({
  props: {
    ...surveyPanelDynamicNodeType.createDefaultProps(),
    id: crypto.randomUUID(),
    maxPanelCount: 2,
    minPanelCount: 1,
    template: [
      {
        props: { ...surveyBooleanNodeType.createDefaultProps(), id: crypto.randomUUID(), name: "a" },
        type: SurveyNodeType.Boolean,
      },
      {
        props: {
          ...surveyTextNodeType.createDefaultProps(),
          id: crypto.randomUUID(),
          isRequired: true,
          name: "b",
          visibleIf: "{panel.a}",
        },
        type: SurveyNodeType.Text,
      },
    ],
  },
  type: SurveyNodeType.PanelDynamic,
});

describe(createSurveyPanelDynamicAnswerSchema, () => {
  const now = new Date(0);
  const values = {};
  const createTemplateAnswerSchema = (question: SurveyTemplateNode) => createSurveyAnswerSchema(question, values, now);
  const createSchema = (node = createPanelDynamicNode()) =>
    createSurveyPanelDynamicAnswerSchema(node, createTemplateAnswerSchema, values, now);

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

  test("refuses a panel that leaves a required question of its template empty", () => {
    expect.hasAssertions();

    const result = createSchema(createPanelDynamicNode(true)).safeParse([{ a: "" }]);

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_REQUIRED_MESSAGE);
  });

  test("accepts an empty answer to a template question its row hides", () => {
    expect.hasAssertions();

    const result = createSchema(createGatedPanelDynamicNode()).safeParse([{ a: false, b: "" }]);

    expect(result.success).toBe(true);
  });

  test("refuses an empty answer to a template question its row shows", () => {
    expect.hasAssertions();

    const result = createSchema(createGatedPanelDynamicNode()).safeParse([{ a: true, b: "" }]);

    expect(getSurveyFirstMessage(result)).toBe(SURVEY_REQUIRED_MESSAGE);
  });

  test("reads each row's own answers as the panel scope", () => {
    expect.hasAssertions();

    const result = createSchema(createGatedPanelDynamicNode()).safeParse([
      { a: true, b: " " },
      { a: false, b: "" },
    ]);

    expect(result.success).toBe(true);
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
