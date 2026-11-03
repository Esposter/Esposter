// @vitest-environment nuxt
import ResourceSurveyCreatorTheme from "@/components/Resource/Survey/Creator/Theme.vue";
import UiFileField from "@/components/Ui/FileField.vue";
import UiSelect from "@/components/Ui/Select/Index.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { useSurveyFiles } from "@/composables/survey/useSurveyFiles";
import { UiStyles } from "@/models/ui/UiStyle";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { surveyDocumentSchema, SurveyProgressBarPlacement } from "survey-engine";
import { afterEach, describe, expect, test, vi } from "vitest";

const { deleteFile, uploadFile } = vi.hoisted(() => ({
  deleteFile: vi.fn<(url: string) => Promise<void>>(() => Promise.resolve()),
  uploadFile: vi.fn<(file: File) => Promise<string>>(),
}));

vi.mock(import("@/composables/resource/useUploadResourceFile"), () => ({ useUploadResourceFile: () => uploadFile }));
vi.mock(import("@/composables/resource/useDeleteResourceFile"), () => ({ useDeleteResourceFile: () => deleteFile }));

describe("resourceSurveyCreatorTheme", () => {
  const accentColor = "#00ff00";

  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);
    afterEach(() => {
      vi.clearAllMocks();
    });

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
      await component
        .findAll("button")
        .find((button) => button.text() === "Clear accent colour")
        ?.trigger("click");
      await flushPromises();

      expect(surveyDocument.value.root.props.accentColor).toBe("");
    });

    test("the progress bar select writes the placement it picks to the survey's root", async () => {
      expect.hasAssertions();
      const surveyCreatorStore = useSurveyCreatorStore();
      const { load } = surveyCreatorStore;
      load(surveyDocumentSchema.parse({ content: [], root: { props: {} } }));
      const { document: surveyDocument } = storeToRefs(surveyCreatorStore);

      const component = await mountSuspended(ResourceSurveyCreatorTheme);
      component.getComponent(UiSelect).vm.$emit("update:modelValue", SurveyProgressBarPlacement.Bottom);
      await flushPromises();

      expect(surveyDocument.value.root.props.showProgressBar).toBe(SurveyProgressBarPlacement.Bottom);
    });

    test("flipping the question numbers switch writes its state to the survey's root", async () => {
      expect.hasAssertions();
      const surveyCreatorStore = useSurveyCreatorStore();
      const { load } = surveyCreatorStore;
      load(surveyDocumentSchema.parse({ content: [], root: { props: {} } }));
      const { document: surveyDocument } = storeToRefs(surveyCreatorStore);

      const component = await mountSuspended(ResourceSurveyCreatorTheme);
      await component.get('[role="switch"]').trigger("click");
      await flushPromises();

      expect(surveyDocument.value.root.props.showQuestionNumbers).toBe(true);
    });

    test("the progress bar select and the question numbers switch show the settings the survey holds", async () => {
      expect.hasAssertions();
      const surveyCreatorStore = useSurveyCreatorStore();
      const { load } = surveyCreatorStore;
      load(
        surveyDocumentSchema.parse({
          content: [],
          root: { props: { showProgressBar: SurveyProgressBarPlacement.Top, showQuestionNumbers: true } },
        }),
      );

      const component = await mountSuspended(ResourceSurveyCreatorTheme);

      expect(component.getComponent(UiSelect).props("modelValue")).toBe(SurveyProgressBarPlacement.Top);
      expect(component.get('[role="switch"]').attributes("aria-checked")).toBe("true");
    });

    // The editor opens on a survey with no logo, uploads one, removes it, and closes: the logo's file is then deleted
    test("a logo uploaded and removed in the session is deleted when the editor closes", async () => {
      expect.hasAssertions();
      const surveyCreatorStore = useSurveyCreatorStore();
      const { load } = surveyCreatorStore;
      load(surveyDocumentSchema.parse({ content: [], root: { props: {} } }));
      const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
      const { sweep, track } = useSurveyFiles();
      track(surveyDocument.value);
      const url = "b";
      uploadFile.mockResolvedValue(url);

      const component = await mountSuspended(ResourceSurveyCreatorTheme);
      component.getComponent(UiFileField).vm.$emit("update:modelValue", [new File(["a"], "a")]);
      await flushPromises();
      await component
        .findAll("button")
        .find((button) => button.text() === "Remove logo")
        ?.trigger("click");
      await flushPromises();
      await sweep(surveyDocument.value);

      expect(deleteFile).toHaveBeenCalledExactlyOnceWith(url);
    });
  });
});
