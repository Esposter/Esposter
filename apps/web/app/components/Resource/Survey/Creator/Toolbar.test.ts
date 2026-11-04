// @vitest-environment nuxt
import ResourceSurveyCreatorToolbar from "@/components/Resource/Survey/Creator/Toolbar.vue";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { surveyDocumentSchema, SurveyNodeType } from "headless-survey-engine";
import { describe, expect, test } from "vitest";

describe("resourceSurveyCreatorToolbar", () => {
  test("undo and redo are disabled until an edit gives them something to act on", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = useSurveyCreatorStore();
    surveyCreatorStore.load(surveyDocumentSchema.parse({ content: [], root: { props: {} } }));
    const component = await mountSuspended(ResourceSurveyCreatorToolbar);

    expect(component.get<HTMLButtonElement>('[aria-label="Undo"]').element.disabled).toBe(true);
    expect(component.get<HTMLButtonElement>('[aria-label="Redo"]').element.disabled).toBe(true);
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

    await component
      .findAll("button")
      .find((button) => button.text() === "Preview")
      ?.trigger("click");

    expect(surveyCreatorStore.isPreview).toBe(true);

    await component
      .findAll("button")
      .find((button) => button.text() === "Design")
      ?.trigger("click");

    expect(surveyCreatorStore.isPreview).toBe(false);
  });
});
