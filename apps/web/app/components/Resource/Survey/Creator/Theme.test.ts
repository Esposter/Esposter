// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import ResourceSurveyCreatorTheme from "#src/components/Resource/Survey/Creator/Theme.vue";
import UiFileField from "#src/components/Ui/FileField.vue";
import UiSelect from "#src/components/Ui/Select/Index.vue";
import { setupUiStyle } from "#src/components/Ui/setupUiStyle.test";
import { useSurveyFiles } from "#src/composables/survey/useSurveyFiles";
import { UiStyles } from "#src/models/ui/UiStyle";
import { EMPTY_FILE_MESSAGE } from "#src/services/file/constants";
import { useAlertStore } from "#src/store/alert";
import { useSurveyCreatorStore } from "#src/store/survey/creator";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, assert, describe, expect, test, vi } from "vitest";
import { surveyDocumentSchema, SurveyProgressBarPlacement } from "vue-survey-engine-headless";

const { deleteFile, uploadFile } = vi.hoisted(() => ({
  deleteFile: vi.fn<(url: string) => void>(),
  uploadFile: vi.fn<(file: File) => Promise<string>>(),
}));

vi.mock(import("#src/composables/resource/useUploadResourceFile"), () => ({ useUploadResourceFile: () => uploadFile }));
vi.mock(import("#src/composables/resource/useDeleteResourceFile"), () => ({ useDeleteResourceFile: () => deleteFile }));

// The background picture's field is the second file field the Theme tab draws, after the logo's
const findBackgroundField = (component: VueWrapper) =>
  component.findAllComponents(UiFileField).find((field) => field.props("label") === "Background picture");

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
      load(surveyDocumentSchema.parse({ content: [], root: { props: { accentColor, backgroundImage: "" } } }));

      const component = await mountSuspended(ResourceSurveyCreatorTheme);

      expect(component.get('[aria-label="Preview"]').attributes("style")).toBe(`--ui-accent: ${accentColor};`);
    });

    test("clearing the accent colour writes an empty one to the survey's root", async () => {
      expect.hasAssertions();
      const surveyCreatorStore = useSurveyCreatorStore();
      const { load } = surveyCreatorStore;
      load(surveyDocumentSchema.parse({ content: [], root: { props: { accentColor, backgroundImage: "" } } }));
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
      load(surveyDocumentSchema.parse({ content: [], root: { props: { backgroundImage: "" } } }));
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
      load(surveyDocumentSchema.parse({ content: [], root: { props: { backgroundImage: "" } } }));
      const { document: surveyDocument } = storeToRefs(surveyCreatorStore);

      const component = await mountSuspended(ResourceSurveyCreatorTheme);
      await component.get('[role="switch"]').trigger("click");
      await flushPromises();

      expect(surveyDocument.value.root.props.isQuestionNumbersVisible).toBe(true);
    });

    test("the progress bar select and the question numbers switch show the settings the survey holds", async () => {
      expect.hasAssertions();
      const surveyCreatorStore = useSurveyCreatorStore();
      const { load } = surveyCreatorStore;
      load(
        surveyDocumentSchema.parse({
          content: [],
          root: {
            props: {
              backgroundImage: "",
              isQuestionNumbersVisible: true,
              showProgressBar: SurveyProgressBarPlacement.Top,
            },
          },
        }),
      );

      const component = await mountSuspended(ResourceSurveyCreatorTheme);

      expect(component.get('[role="combobox"]').text()).toBe("Top of the survey");
      expect(component.get('[role="switch"]').attributes("aria-checked")).toBe("true");
    });

    // The editor opens on a survey with no logo, uploads one, removes it, and closes: the logo's file is then deleted
    test("a logo uploaded and removed in the session is deleted when the editor closes", async () => {
      expect.hasAssertions();
      const surveyCreatorStore = useSurveyCreatorStore();
      const { load } = surveyCreatorStore;
      load(surveyDocumentSchema.parse({ content: [], root: { props: { backgroundImage: "" } } }));
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
      sweep(surveyDocument.value);

      expect(deleteFile).toHaveBeenCalledExactlyOnceWith(url);
    });

    test("owner uploads a background picture on the theme tab", async () => {
      expect.hasAssertions();
      const surveyCreatorStore = useSurveyCreatorStore();
      const { load } = surveyCreatorStore;
      load(surveyDocumentSchema.parse({ content: [], root: { props: { backgroundImage: "" } } }));
      const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
      const url = "b";
      uploadFile.mockResolvedValue(url);

      const component = await mountSuspended(ResourceSurveyCreatorTheme);
      const field = findBackgroundField(component);
      assert.exists(field);
      field.vm.$emit("update:modelValue", [new File(["a"], "a")]);
      await flushPromises();

      expect(surveyDocument.value.root.props.backgroundImage).toBe(url);
    });

    test("owner removes the background picture", async () => {
      expect.hasAssertions();
      const surveyCreatorStore = useSurveyCreatorStore();
      const { load } = surveyCreatorStore;
      load(surveyDocumentSchema.parse({ content: [], root: { props: { backgroundImage: "b" } } }));
      const { document: surveyDocument } = storeToRefs(surveyCreatorStore);

      const component = await mountSuspended(ResourceSurveyCreatorTheme);
      await component
        .findAll("button")
        .find((button) => button.text() === "Remove background picture")
        ?.trigger("click");
      await flushPromises();

      expect(surveyDocument.value.root.props.backgroundImage).toBe("");
    });

    test("a rejected background picture leaves the survey unchanged", async () => {
      expect.hasAssertions();
      const surveyCreatorStore = useSurveyCreatorStore();
      const { load } = surveyCreatorStore;
      load(surveyDocumentSchema.parse({ content: [], root: { props: { backgroundImage: "" } } }));
      const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
      const alertStore = useAlertStore();
      const { alerts } = storeToRefs(alertStore);

      const component = await mountSuspended(ResourceSurveyCreatorTheme);
      const field = findBackgroundField(component);
      assert.exists(field);
      field.vm.$emit("update:modelValue", [new File([], "empty.png", { type: "image/png" })]);
      await flushPromises();

      expect(uploadFile).not.toHaveBeenCalled();
      expect(alerts.value.map(({ text }) => text)).toStrictEqual([`empty.png: ${EMPTY_FILE_MESSAGE}`]);
      expect(surveyDocument.value.root.props.backgroundImage).toBe("");
    });

    test("the theme tab preview draws the picture as the respondent page does", async () => {
      expect.hasAssertions();
      const surveyCreatorStore = useSurveyCreatorStore();
      const { load } = surveyCreatorStore;
      load(surveyDocumentSchema.parse({ content: [], root: { props: { backgroundImage: "background.png" } } }));

      const component = await mountSuspended(ResourceSurveyCreatorTheme);

      expect(component.get('[aria-label="Preview"] img').attributes("src")).toContain("background.png");
    });
  });
});
