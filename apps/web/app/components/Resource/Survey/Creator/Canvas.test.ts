// @vitest-environment nuxt
import ResourceSurveyCreatorCanvas from "@/components/Resource/Survey/Creator/Canvas.vue";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { surveyDocumentSchema, SurveyNodeType } from "survey-engine";
import { describe, expect, test } from "vitest";

const loadSurvey = () => {
  const surveyCreatorStore = useSurveyCreatorStore();
  surveyCreatorStore.load(
    surveyDocumentSchema.parse({
      content: [
        {
          props: { children: [{ props: { id: "question", name: "question" }, type: SurveyNodeType.Text }], id: "page" },
          type: SurveyNodeType.Page,
        },
      ],
      root: { props: {} },
    }),
  );
  return surveyCreatorStore;
};

describe("resourceSurveyCreatorCanvas", () => {
  // The page is the first focusable element the canvas draws, and its question the second
  const questionPointer = "/content/0/props/children/0";

  test("clicking a question selects it", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = loadSurvey();
    const component = await mountSuspended(ResourceSurveyCreatorCanvas);

    await component.findAll('[tabindex="0"]').at(1)?.trigger("click");

    expect(surveyCreatorStore.selectedPointer).toBe(questionPointer);
  });

  test("pressing Enter on a focused question selects it from the keyboard", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = loadSurvey();
    const component = await mountSuspended(ResourceSurveyCreatorCanvas);

    await component.findAll('[tabindex="0"]').at(1)?.trigger("keydown", { key: "Enter" });

    expect(surveyCreatorStore.selectedPointer).toBe(questionPointer);
  });
});
