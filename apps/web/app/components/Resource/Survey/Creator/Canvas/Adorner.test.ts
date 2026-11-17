// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";
import type { SurveyChoice } from "vue-survey-engine-headless";

import ResourceSurveyCreatorCanvas from "#src/components/Resource/Survey/Creator/Canvas/Index.vue";
import { useSurveyCreatorCommands } from "#src/composables/survey/useSurveyCreatorCommands";
import { useSurveyCreatorStore } from "#src/store/survey/creator";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { beforeAll, describe, expect, test } from "vitest";
import { surveyDocumentSchema, SurveyNodeType, surveyNodeTypeDefinitionMap } from "vue-survey-engine-headless";

// A one-page survey of the given questions
const createSurvey = (children: object[]) =>
  surveyDocumentSchema.parse({
    content: [{ props: { children, enableIf: "", id: "page" }, type: SurveyNodeType.Page }],
    root: { props: { backgroundImage: "" } },
  });
const loadSurvey = (children: object[]) => {
  const surveyCreatorStore = useSurveyCreatorStore();
  surveyCreatorStore.load(createSurvey(children));
  useSurveyCreatorCommands().select("/content/0/props/children/0");
  return surveyCreatorStore;
};
const findButton = (component: VueWrapper, text: string) =>
  component.findAll("button").find((button) => button.text() === text);
const findMenuItem = (component: VueWrapper, title: string) =>
  component.findAll('[role="menuitem"]').find((item) => item.text().startsWith(title));

describe("resourceSurveyCreatorCanvasAdorner", () => {
  const choices: SurveyChoice[] = [
    { text: "one", value: 1 },
    { text: "two", value: 2 },
    { text: "three", value: 3 },
  ];
  const radioGroup = { props: { choices, id: "question", name: "question" }, type: SurveyNodeType.RadioGroup };
  const textQuestion = { props: { id: "first", name: "first" }, type: SurveyNodeType.Text };

  // A field loads on demand through a dynamic import, which is module I/O rather than a microtask
  beforeAll(async () => {
    await import("#src/components/Resource/Survey/Field/Text.vue");
  });

  test("the required adorner toggles the flag", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = loadSurvey([textQuestion]);
    const component = await mountSuspended(ResourceSurveyCreatorCanvas);
    await findButton(component, "Required")?.trigger("click");
    await flushPromises();

    expect(surveyCreatorStore.document).toStrictEqual(
      createSurvey([{ props: { id: "first", isRequired: true, name: "first" }, type: SurveyNodeType.Text }]),
    );
  });

  test("the duplicate adorner copies the question after it", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = loadSurvey([
      textQuestion,
      { props: { id: "second", name: "second" }, type: SurveyNodeType.Text },
    ]);
    const component = await mountSuspended(ResourceSurveyCreatorCanvas);
    await component.get('[aria-label="Duplicate"]').trigger("click");
    await flushPromises();

    const names = surveyCreatorStore.document.content[0]?.props.children.map(({ props }) =>
      "name" in props ? props.name : "",
    );
    expect(names).toStrictEqual(["first", "first1", "second"]);
    expect(surveyCreatorStore.selectedPointer).toBe("/content/0/props/children/1");
  });

  test("a choice question becomes another choice kind with its choices", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = loadSurvey([radioGroup]);
    const component = await mountSuspended(ResourceSurveyCreatorCanvas);
    await component.get('[aria-label="Change kind"]').trigger("click");
    await findMenuItem(component, surveyNodeTypeDefinitionMap[SurveyNodeType.Checkbox].label)?.trigger("click");
    await flushPromises();

    expect(surveyCreatorStore.document).toStrictEqual(
      createSurvey([{ props: { choices, id: "question", name: "question" }, type: SurveyNodeType.Checkbox }]),
    );
  });

  test("a change that drops content asks first", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = loadSurvey([radioGroup]);
    const component = await mountSuspended(ResourceSurveyCreatorCanvas);
    await component.get('[aria-label="Change kind"]').trigger("click");
    await findMenuItem(component, surveyNodeTypeDefinitionMap[SurveyNodeType.Text].label)?.trigger("click");
    await flushPromises();
    await findButton(component, "Cancel")?.trigger("click");
    await flushPromises();

    expect(surveyCreatorStore.document).toStrictEqual(createSurvey([radioGroup]));
  });

  test("a kind change undoes as one step", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = loadSurvey([radioGroup]);
    const component = await mountSuspended(ResourceSurveyCreatorCanvas);
    await component.get('[aria-label="Change kind"]').trigger("click");
    await findMenuItem(component, surveyNodeTypeDefinitionMap[SurveyNodeType.Text].label)?.trigger("click");
    await flushPromises();
    await findButton(component, "Change kind")?.trigger("click");
    await flushPromises();
    useSurveyCreatorCommands().undo();
    await flushPromises();

    expect(surveyCreatorStore.document).toStrictEqual(createSurvey([radioGroup]));
  });
});
