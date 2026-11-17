// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";
import type { SurveyChoice } from "vue-survey-engine-headless";

import ResourceSurveyCreatorCanvas from "#src/components/Resource/Survey/Creator/Canvas/Index.vue";
import { useSurveyCreatorCommands } from "#src/composables/survey/useSurveyCreatorCommands";
import { createSurveyOnePageTestDocument } from "#src/services/survey/createSurveyOnePageTestDocument.test";
import { useSurveyCreatorStore } from "#src/store/survey/creator";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { SurveyNodeType } from "vue-survey-engine-headless";

// A one-page survey of one radio group with the given choices
const createSurvey = (choices: SurveyChoice[]) =>
  createSurveyOnePageTestDocument([
    { props: { choices, id: "question", name: "question" }, type: SurveyNodeType.RadioGroup },
  ]);
const loadChoiceQuestion = (choices: SurveyChoice[]) => {
  const surveyCreatorStore = useSurveyCreatorStore();
  surveyCreatorStore.load(createSurvey(choices));
  useSurveyCreatorCommands().select("/content/0/props/children/0");
  return surveyCreatorStore;
};
const findChoice = (component: VueWrapper, index: number) => component.get(`span[aria-label="Choice ${index}"]`);

describe("resourceSurveyCreatorCanvasEditableChoices", () => {
  test("enter in the last choice adds one", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = loadChoiceQuestion([{ text: "first", value: 1 }]);
    const component = await mountSuspended(ResourceSurveyCreatorCanvas);
    await findChoice(component, 1).trigger("click");
    await component.get('input[aria-label="Choice 1"]').trigger("keydown", { key: "Enter" });
    await flushPromises();

    expect(surveyCreatorStore.document).toStrictEqual(
      createSurvey([
        { text: "first", value: 1 },
        { text: "", value: 2 },
      ]),
    );
    expect(component.find('input[aria-label="Choice 2"]').exists()).toBe(true);
  });

  test("an emptied choice is removed on commit", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = loadChoiceQuestion([
      { text: "first", value: 1 },
      { text: "second", value: 2 },
    ]);
    const component = await mountSuspended(ResourceSurveyCreatorCanvas);
    await findChoice(component, 2).trigger("click");
    await component.get('input[aria-label="Choice 2"]').setValue("");
    await component.get('input[aria-label="Choice 2"]').trigger("keydown", { key: "Enter" });
    await flushPromises();

    expect(surveyCreatorStore.document).toStrictEqual(createSurvey([{ text: "first", value: 1 }]));
  });

  test("a choice added and left empty is removed on focus leaving it", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = loadChoiceQuestion([{ text: "first", value: 1 }]);
    const component = await mountSuspended(ResourceSurveyCreatorCanvas);
    await findChoice(component, 1).trigger("click");
    await component.get('input[aria-label="Choice 1"]').trigger("keydown", { key: "Enter" });
    await flushPromises();
    await component.get('input[aria-label="Choice 2"]').trigger("focusout");
    await flushPromises();

    expect(surveyCreatorStore.document).toStrictEqual(createSurvey([{ text: "first", value: 1 }]));
  });

  test("the last choice cannot be removed", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = loadChoiceQuestion([{ text: "first", value: 1 }]);
    const component = await mountSuspended(ResourceSurveyCreatorCanvas);
    await findChoice(component, 1).trigger("click");
    await component.get('input[aria-label="Choice 1"]').setValue("");
    await component.get('input[aria-label="Choice 1"]').trigger("keydown", { key: "Enter" });
    await flushPromises();

    expect(surveyCreatorStore.document).toStrictEqual(createSurvey([{ text: "first", value: 1 }]));
    expect(findChoice(component, 1).text()).toBe("first");
  });

  test("alt and the arrow keys reorder a choice", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = loadChoiceQuestion([
      { text: "first", value: 1 },
      { text: "second", value: 2 },
    ]);
    const component = await mountSuspended(ResourceSurveyCreatorCanvas);
    await findChoice(component, 1).trigger("keydown", { altKey: true, key: "ArrowDown" });
    await flushPromises();

    expect(surveyCreatorStore.document).toStrictEqual(
      createSurvey([
        { text: "second", value: 2 },
        { text: "first", value: 1 },
      ]),
    );
  });
});
