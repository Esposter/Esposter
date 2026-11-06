// @vitest-environment nuxt
import ResourceSurveyCreatorToolbar from "@/components/Resource/Survey/Creator/Toolbar.vue";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { surveyDocumentSchema, SurveyNodeType } from "vue-survey-engine-headless";
import { describe, expect, test } from "vitest";

describe("resourceSurveyCreatorToolbar", () => {
  test("undo and redo are disabled until an edit gives them something to act on", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = useSurveyCreatorStore();
    surveyCreatorStore.load(surveyDocumentSchema.parse({ content: [], root: { props: {} } }));
    const component = await mountSuspended(ResourceSurveyCreatorToolbar);

    expect(component.get('[aria-label="Undo"]').attributes("aria-disabled")).toBe("true");
    expect(component.get('[aria-label="Redo"]').attributes("aria-disabled")).toBe("true");
  });

  test("the Preview choice makes the store preview the survey, and Design takes it back", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = useSurveyCreatorStore();
    surveyCreatorStore.load(
      surveyDocumentSchema.parse({
        content: [{ props: { children: [], id: "page" }, type: SurveyNodeType.Page }],
        root: { props: {} },
      }),
    );
    const component = await mountSuspended(ResourceSurveyCreatorToolbar);

    await component.get('[aria-label="Preview"]').trigger("click");

    expect(surveyCreatorStore.isPreview).toBe(true);

    await component.get('[aria-label="Design"]').trigger("click");

    expect(surveyCreatorStore.isPreview).toBe(false);
  });

  test("import, Export and Clear are in the overflow menu", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = useSurveyCreatorStore();
    surveyCreatorStore.load(surveyDocumentSchema.parse({ content: [], root: { props: {} } }));
    const component = await mountSuspended(ResourceSurveyCreatorToolbar);

    expect(component.find('[aria-label="Import"]').exists()).toBe(false);
    expect(component.find('[aria-label="Export"]').exists()).toBe(false);
    expect(component.find('[aria-label="Clear"]').exists()).toBe(false);

    await component.get('[aria-label="More Survey actions"]').trigger("keydown", { key: "ArrowDown" });
    await flushPromises();

    expect(component.findAll('[role="menuitem"]').map((item) => item.text())).toStrictEqual([
      "Import",
      "Export",
      "Clear",
    ]);
  });
});
