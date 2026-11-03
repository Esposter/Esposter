import type { SurveyNode } from "#src/models/SurveyNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { surveyDocumentSchema } from "#src/services/surveyDocumentSchema";
import { surveyNodeSchema } from "#src/services/surveyNodeSchema";
import { surveyNodeTypeDefinitionMap } from "#src/services/surveyNodeTypeDefinitionMap";
import { describe, expect, test } from "vitest";

// A minimal node of a type: its definition's default props, its slots empty, and a fresh id
const createNode = (type: SurveyNodeType, id = crypto.randomUUID()): unknown => {
  const definition = surveyNodeTypeDefinitionMap[type];
  const slots = Object.fromEntries(Object.keys(definition.slots).map((slot) => [slot, []]));
  return { props: { ...definition.createDefaultProps(), ...slots, id }, type };
};

describe("surveyNodeSchema", () => {
  // The union is written by hand, so a kind added to the enum and left out of it is caught only here
  test.each(Object.values(SurveyNodeType))("the %s type is accepted by the node union", (type) => {
    expect.hasAssertions();

    expect(surveyNodeSchema.safeParse(createNode(type)).success).toBe(true);
  });
});

describe("surveyDocumentSchema", () => {
  const rootProps = { title: "Survey" };

  test("a page holding a panel, a question and a dynamic panel parses", () => {
    expect.hasAssertions();

    const panel = createNode(SurveyNodeType.Panel);
    const page = createNode(SurveyNodeType.Page) as SurveyNode;
    const document = {
      content: [
        {
          ...page,
          props: {
            ...page.props,
            children: [panel, createNode(SurveyNodeType.Text), createNode(SurveyNodeType.PanelDynamic)],
          },
        },
      ],
      root: { props: rootProps },
    };

    expect(surveyDocumentSchema.safeParse(document).success).toBe(true);
  });

  test("a dynamic panel's template refuses a dynamic panel", () => {
    expect.hasAssertions();

    const dynamic = createNode(SurveyNodeType.PanelDynamic) as SurveyNode;
    const page = createNode(SurveyNodeType.Page) as SurveyNode;
    const nested = { ...dynamic, props: { ...dynamic.props, template: [createNode(SurveyNodeType.PanelDynamic)] } };
    const document = {
      content: [{ ...page, props: { ...page.props, children: [nested] } }],
      root: { props: rootProps },
    };

    expect(surveyDocumentSchema.safeParse(document).success).toBe(false);
  });

  test("the root refuses a question that is not on a page", () => {
    expect.hasAssertions();

    const document = { content: [createNode(SurveyNodeType.Text)], root: { props: rootProps } };

    expect(surveyDocumentSchema.safeParse(document).success).toBe(false);
  });
});
