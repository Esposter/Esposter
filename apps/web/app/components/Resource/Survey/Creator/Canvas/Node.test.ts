// @vitest-environment nuxt
import ResourceSurveyCreatorCanvas from "#src/components/Resource/Survey/Creator/Canvas/Index.vue";
import { useSurveyCreatorCommands } from "#src/composables/survey/useSurveyCreatorCommands";
import { createSurveyOnePageTestDocument } from "#src/services/survey/createSurveyOnePageTestDocument.test";
import { useSurveyCreatorStore } from "#src/store/survey/creator";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { beforeAll, describe, expect, test } from "vitest";
import { SurveyNodeType } from "vue-survey-engine-headless";

// A one-page survey of two text questions
const createSurvey = (titles: string[]) =>
  createSurveyOnePageTestDocument([
    { props: { id: "first", name: "first", title: titles[0] }, type: SurveyNodeType.Text },
    { props: { id: "second", name: "second", title: titles[1] }, type: SurveyNodeType.Text },
  ]);
const loadSurvey = () => {
  const surveyCreatorStore = useSurveyCreatorStore();
  surveyCreatorStore.load(createSurvey(["", ""]));
  return surveyCreatorStore;
};

describe("resourceSurveyCreatorCanvasNode", () => {
  const FIRST_POINTER = "/content/0/props/children/0";

  // A field loads on demand through a dynamic import, which is module I/O rather than a microtask
  beforeAll(async () => {
    await import("#src/components/Resource/Survey/Field/Text.vue");
  });

  test("editing a question's title on the surface", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = loadSurvey();
    useSurveyCreatorCommands().select(FIRST_POINTER);
    const component = await mountSuspended(ResourceSurveyCreatorCanvas);
    await component.get('span[aria-label="Title"]').trigger("click");
    await component.get('input[aria-label="Title"]').setValue("Why");
    await component.get('input[aria-label="Title"]').trigger("keydown", { key: "Enter" });
    await flushPromises();

    expect(surveyCreatorStore.document).toStrictEqual(createSurvey(["Why", ""]));
  });

  test("a run of typing is one undo step", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = loadSurvey();
    useSurveyCreatorCommands().select(FIRST_POINTER);
    const component = await mountSuspended(ResourceSurveyCreatorCanvas);
    await component.get('span[aria-label="Title"]').trigger("click");
    await component.get('input[aria-label="Title"]').setValue("Why");
    await component.get('input[aria-label="Title"]').trigger("keydown", { key: "Enter" });
    useSurveyCreatorCommands().undo();
    await flushPromises();

    expect(surveyCreatorStore.document).toStrictEqual(createSurvey(["", ""]));
  });

  test("an unselected question is not edited by a click", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = loadSurvey();
    const component = await mountSuspended(ResourceSurveyCreatorCanvas);
    // The canvas draws the page first, then its two questions
    await component.findAll('[tabindex="0"]').at(2)?.trigger("click");
    await flushPromises();

    expect(surveyCreatorStore.selectedPointer).toBe("/content/0/props/children/1");
    expect(component.find('input[aria-label="Title"]').exists()).toBe(false);
  });

  test("nothing selected shows no adorner", async () => {
    expect.hasAssertions();

    loadSurvey();
    const component = await mountSuspended(ResourceSurveyCreatorCanvas);

    expect(component.find('[aria-label="Element actions"]').exists()).toBe(false);
  });
});
