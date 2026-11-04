// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";
import type { SurveyDocument, SurveyNode } from "survey-engine";

import CalculatedValues from "@/components/Resource/Survey/Creator/CalculatedValues.vue";
import { getButtonByText } from "@/components/Resource/Survey/Creator/getButtonByText.test";
import UiConfirmDialog from "@/components/Ui/ConfirmDialog.vue";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { checkSurveyDocument, SurveyNodeType, surveyNodeTypeDefinitionMap, surveyRootPropsSchema } from "survey-engine";
import { assert, describe, expect, test } from "vitest";

// A survey of one page holding a question named "a", and the calculated values given by name
const createSurveyTestDocument = (calculatedNames: string[]): SurveyDocument => {
  const question: SurveyNode = {
    props: {
      ...surveyNodeTypeDefinitionMap[SurveyNodeType.Text].createDefaultProps(),
      id: crypto.randomUUID(),
      name: "a",
    },
    type: SurveyNodeType.Text,
  };

  return {
    content: [
      {
        props: {
          ...surveyNodeTypeDefinitionMap[SurveyNodeType.Page].createDefaultProps(),
          children: [question],
          id: crypto.randomUUID(),
        },
        type: SurveyNodeType.Page,
      },
    ],
    root: {
      props: surveyRootPropsSchema.parse({
        calculatedValues: calculatedNames.map((name) => ({ expression: "0", includeIntoResult: false, name })),
      }),
    },
  };
};

// The field a label names, found through the `for` its label points at
const getFieldByLabel = (component: VueWrapper, label: string) => {
  const id = component
    .findAll("label")
    .find((item) => item.text() === label)
    ?.attributes("for");
  return component.get(`[id="${id}"]`);
};

describe("resourceSurveyCreatorCalculatedValues", () => {
  test("a name that collides with a question is refused with the survey check's message and saves nothing", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = useSurveyCreatorStore();
    surveyCreatorStore.load(createSurveyTestDocument(["b"]));
    const [issue] = checkSurveyDocument(createSurveyTestDocument(["a"]));
    const component = await mountSuspended(CalculatedValues);

    await getFieldByLabel(component, "Name").setValue("a");

    expect(component.get('[role="alert"]').text()).toBe(issue?.message);
    expect(surveyCreatorStore.document.root.props.calculatedValues.map(({ name }) => name)).toStrictEqual(["b"]);

    component.unmount();
  });

  test("a calculated value added takes a name no answer or value holds", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = useSurveyCreatorStore();
    surveyCreatorStore.load(createSurveyTestDocument(["b"]));
    const component = await mountSuspended(CalculatedValues);

    await getButtonByText(component, "Add a calculated value")?.trigger("click");

    expect(surveyCreatorStore.document.root.props.calculatedValues.map(({ name }) => name)).toStrictEqual([
      "b",
      "value",
    ]);

    component.unmount();
  });

  test("a removal asks first, and removes the value it asked about once confirmed", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = useSurveyCreatorStore();
    surveyCreatorStore.load(createSurveyTestDocument(["b", "c"]));
    const component = await mountSuspended(CalculatedValues);

    await component.findAll('[aria-label="Remove calculated value"]')[0]?.trigger("click");
    await flushPromises();

    expect(surveyCreatorStore.document.root.props.calculatedValues.map(({ name }) => name)).toStrictEqual(["b", "c"]);

    await getButtonByText(component, "Remove")?.trigger("click");
    await flushPromises();

    expect(surveyCreatorStore.document.root.props.calculatedValues.map(({ name }) => name)).toStrictEqual(["c"]);

    component.unmount();
  });

  test("cancelling the ask removes nothing", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = useSurveyCreatorStore();
    surveyCreatorStore.load(createSurveyTestDocument(["b", "c"]));
    const component = await mountSuspended(CalculatedValues);

    await component.get('[aria-label="Remove calculated value"]').trigger("click");

    expect(component.findComponent(UiConfirmDialog).props("modelValue")).toBe(true);

    const cancelButton = getButtonByText(component, "Cancel");
    assert.exists(cancelButton);
    await cancelButton.trigger("click");
    await flushPromises();

    expect(surveyCreatorStore.document.root.props.calculatedValues.map(({ name }) => name)).toStrictEqual(["b", "c"]);

    component.unmount();
  });
});
