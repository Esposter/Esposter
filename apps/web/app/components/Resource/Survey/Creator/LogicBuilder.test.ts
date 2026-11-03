// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";
import type { SurveyDocument, SurveyPlaceableNode } from "survey-engine";

import LogicBuilder from "@/components/Resource/Survey/Creator/LogicBuilder.vue";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { surveyNodeTypeDefinitionMap, surveyRootPropsSchema, SurveyNodeType } from "survey-engine";
import { describe, expect, test } from "vitest";

// A survey of one page holding the given text questions, each with the condition it shows under
const createSurveyTestDocument = (questions: SurveyPlaceableNode[]): SurveyDocument => ({
  content: [
    {
      props: {
        ...surveyNodeTypeDefinitionMap[SurveyNodeType.Page].createDefaultProps(),
        children: questions,
        id: crypto.randomUUID(),
      },
      type: SurveyNodeType.Page,
    },
  ],
  root: { props: surveyRootPropsSchema.parse({}) },
});

const createQuestion = (name: string, visibleIf: string): SurveyPlaceableNode => ({
  props: {
    ...surveyNodeTypeDefinitionMap[SurveyNodeType.Text].createDefaultProps(),
    id: crypto.randomUUID(),
    name,
    visibleIf,
  },
  type: SurveyNodeType.Text,
});

// The field a label names, found through the `for` its label points at
const getFieldByLabel = (component: VueWrapper, label: string) => {
  const id = component
    .findAll("label")
    .find((item) => item.text() === label)
    ?.attributes("for");
  return component.get(`[id="${id}"]`);
};

const getButtonByText = (component: VueWrapper, text: string) =>
  component.findAll("button").find((button) => button.text() === text);

describe("resourceSurveyCreatorLogicBuilder", () => {
  test("adding a row and typing its value writes the condition the row reads", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = useSurveyCreatorStore();
    surveyCreatorStore.load(createSurveyTestDocument([createQuestion("a", ""), createQuestion("b", "")]));
    surveyCreatorStore.selectedPointer = "/content/0/props/children/1";
    const component = await mountSuspended(LogicBuilder);
    await getButtonByText(component, "Add a condition")?.trigger("click");

    await getFieldByLabel(component, "Value").setValue("yes");

    expect(surveyCreatorStore.selectedNode?.props.visibleIf).toBe("{a} = 'yes'");

    component.unmount();
  });

  test("an expression that does not parse shows its error and saves nothing", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = useSurveyCreatorStore();
    surveyCreatorStore.load(createSurveyTestDocument([createQuestion("a", ""), createQuestion("b", "{a} > 5")]));
    surveyCreatorStore.selectedPointer = "/content/0/props/children/1";
    const component = await mountSuspended(LogicBuilder);

    await getFieldByLabel(component, "Expression").setValue("{a} >");

    expect(component.get('[role="alert"]').text()).toBe("Expected an expression at character 6");
    expect(surveyCreatorStore.selectedNode?.props.visibleIf).toBe("{a} > 5");

    component.unmount();
  });
});
