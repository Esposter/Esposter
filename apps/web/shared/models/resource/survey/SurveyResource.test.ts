import type { SurveyDocument, SurveyPageNode, SurveyPlaceableNode, SurveyTextNode } from "vue-survey-engine-headless";

import { surveyResourceSchema } from "#shared/models/resource/survey/SurveyResource";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";
import {
  createSurveyDocument,
  SurveyNodeType,
  surveyPageNodeType,
  surveyRootPropsSchema,
  surveyTextNodeType,
} from "vue-survey-engine-headless";

// Each node takes a fresh id, which the document requires to be unique
const createQuestion = (name: string): SurveyTextNode => ({
  props: { ...surveyTextNodeType.createDefaultProps(), id: v7(), name },
  type: SurveyNodeType.Text,
});
const createPage = (children: SurveyPlaceableNode[]): SurveyPageNode => ({
  props: { ...surveyPageNodeType.createDefaultProps(), children, id: v7() },
  type: SurveyNodeType.Page,
});
const createDocument = (children: SurveyPlaceableNode[]): SurveyDocument => ({
  content: [createPage(children)],
  root: { props: surveyRootPropsSchema.parse({}) },
});

describe("surveyResourceSchema", () => {
  test("accepts a survey document with its settings", () => {
    expect.hasAssertions();

    expect(surveyResourceSchema.safeParse({ document: createSurveyDocument(), settings: {} }).success).toBe(true);
  });

  test("refuses a document the save check reports, at the question it names", () => {
    expect.hasAssertions();

    const result = surveyResourceSchema.safeParse({
      document: createDocument([createQuestion("a"), createQuestion("a")]),
      settings: {},
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map(({ path }) => path.join("."))).toStrictEqual([
      "document.content.0.props.children.1.props.name",
    ]);
  });
});
