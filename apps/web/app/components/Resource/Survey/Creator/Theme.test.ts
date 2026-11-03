// @vitest-environment nuxt
import ResourceSurveyCreatorTheme from "@/components/Resource/Survey/Creator/Theme.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { surveyDocumentSchema } from "survey-engine";
import { describe, expect, test } from "vitest";

describe("resourceSurveyCreatorTheme", () => {
  const accentColor = "#00ff00";

  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    test("the accent colour is applied to the preview as the library's accent token", async () => {
      expect.hasAssertions();
      const surveyCreatorStore = useSurveyCreatorStore();
      const { load } = surveyCreatorStore;
      load(surveyDocumentSchema.parse({ content: [], root: { props: { accentColor } } }));

      const component = await mountSuspended(ResourceSurveyCreatorTheme);

      expect(component.get('[aria-label="Preview"]').attributes("style")).toBe(`--ui-accent: ${accentColor};`);
    });

    test("clearing the accent colour writes an empty one to the survey's root", async () => {
      expect.hasAssertions();
      const surveyCreatorStore = useSurveyCreatorStore();
      const { load } = surveyCreatorStore;
      load(surveyDocumentSchema.parse({ content: [], root: { props: { accentColor } } }));
      const { document: surveyDocument } = storeToRefs(surveyCreatorStore);

      const component = await mountSuspended(ResourceSurveyCreatorTheme);
      component
        .findAll("button")
        .find((button) => button.text() === "Clear accent colour")
        ?.trigger("click");
      await flushPromises();

      expect(surveyDocument.value.root.props.accentColor).toBe("");
    });
  });
});
