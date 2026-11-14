// @vitest-environment nuxt
import type { SurveyDocument } from "vue-survey-engine-headless";

import { getButtonByText } from "@/components/Resource/Survey/Creator/getButtonByText.test";
import ResourceSurveyCreatorImageChoicesEditor from "@/components/Resource/Survey/Creator/ImageChoicesEditor.vue";
import UiConfirmDialog from "@/components/Ui/ConfirmDialog.vue";
import UiFileField from "@/components/Ui/FileField.vue";
import UiTextField from "@/components/Ui/TextField.vue";
import { useSurveyFiles } from "@/composables/survey/useSurveyFiles";
import { useAlertStore } from "@/store/alert";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { assert, describe, expect, test, vi } from "vitest";
import { getBlockNode } from "vue-block-editor-headless";
import { surveyDocumentSchema, surveyNodeChildren, SurveyNodeType } from "vue-survey-engine-headless";

const { deleteFile, uploadFile } = vi.hoisted(() => ({
  deleteFile: vi.fn<(url: string) => Promise<void>>(() => Promise.resolve()),
  uploadFile: vi.fn<(file: File) => Promise<string>>(),
}));

vi.mock(import("@/composables/resource/useUploadResourceFile"), () => ({ useUploadResourceFile: () => uploadFile }));
vi.mock(import("@/composables/resource/useDeleteResourceFile"), () => ({ useDeleteResourceFile: () => deleteFile }));

// A survey whose one page holds an image picker, offering a choice for each of the given pictures
const createDocument = (imageLinks: string[]) =>
  surveyDocumentSchema.parse({
    content: [
      {
        props: {
          children: [
            {
              props: {
                choices: imageLinks.map((imageLink) => ({ imageLink, text: "", value: imageLink })),
                id: v7(),
                name: "picker",
              },
              type: SurveyNodeType.ImagePicker,
            },
          ],
          id: v7(),
        },
        type: SurveyNodeType.Page,
      },
    ],
    root: { props: {} },
  });

const getChoices = (document: SurveyDocument, pointer: string) => {
  const node = getBlockNode(document, pointer, surveyNodeChildren);
  return node?.type === SurveyNodeType.ImagePicker ? node.props.choices : [];
};

describe("resourceSurveyCreatorImageChoicesEditor", () => {
  const pointer = "/content/0/props/children/0";

  test("a picked image adds a choice holding its url, with a value of its own", async () => {
    expect.hasAssertions();
    const surveyCreatorStore = useSurveyCreatorStore();
    const { load } = surveyCreatorStore;
    load(createDocument([]));
    const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
    const url = "b";
    uploadFile.mockResolvedValue(url);

    const component = await mountSuspended(ResourceSurveyCreatorImageChoicesEditor, { props: { pointer } });
    component.getComponent(UiFileField).vm.$emit("update:modelValue", [new File(["a"], "a")]);
    await flushPromises();

    const choices = getChoices(surveyDocument.value, pointer);
    const choice = takeOne(choices, 0);

    expect(choices).toHaveLength(1);
    expect(choice.value).toBeTypeOf("string");
    expect(choice).toStrictEqual({ imageLink: url, text: "", value: choice.value });
  });

  test("a choice row is named by its singular noun, so the first choice reads as Choice 1", async () => {
    expect.hasAssertions();
    const surveyCreatorStore = useSurveyCreatorStore();
    const { load } = surveyCreatorStore;
    load(createDocument(["a"]));

    const component = await mountSuspended(ResourceSurveyCreatorImageChoicesEditor, { props: { pointer } });

    expect(component.get('[role="group"]').attributes("aria-label")).toBe("Choice 1");
  });

  test("moving a choice down swaps it with the choice after it", async () => {
    expect.hasAssertions();
    const surveyCreatorStore = useSurveyCreatorStore();
    const { load } = surveyCreatorStore;
    load(createDocument(["a", "b"]));
    const { document: surveyDocument } = storeToRefs(surveyCreatorStore);

    const component = await mountSuspended(ResourceSurveyCreatorImageChoicesEditor, { props: { pointer } });
    await component.get('[aria-label="Move choice 1 down"]').trigger("click");
    await flushPromises();

    expect(getChoices(surveyDocument.value, pointer).map(({ value }) => value)).toStrictEqual(["b", "a"]);
  });

  test("removing a choice drops it, and the choices after it keep their order", async () => {
    expect.hasAssertions();
    const surveyCreatorStore = useSurveyCreatorStore();
    const { load } = surveyCreatorStore;
    load(createDocument(["a", "b"]));
    const { document: surveyDocument } = storeToRefs(surveyCreatorStore);

    const component = await mountSuspended(ResourceSurveyCreatorImageChoicesEditor, { props: { pointer } });
    await component.get('[aria-label="Remove choice 1"]').trigger("click");
    await getButtonByText(component, "Remove")?.trigger("click");
    await flushPromises();

    expect(getChoices(surveyDocument.value, pointer).map(({ value }) => value)).toStrictEqual(["b"]);
  });

  test("removing a row asks first, and removes it once confirmed", async () => {
    expect.hasAssertions();
    const surveyCreatorStore = useSurveyCreatorStore();
    const { load } = surveyCreatorStore;
    load(createDocument(["a", "b"]));
    const { document: surveyDocument } = storeToRefs(surveyCreatorStore);

    const component = await mountSuspended(ResourceSurveyCreatorImageChoicesEditor, { props: { pointer } });
    await component.get('[aria-label="Remove choice 1"]').trigger("click");
    await flushPromises();

    expect(getChoices(surveyDocument.value, pointer).map(({ value }) => value)).toStrictEqual(["a", "b"]);

    await getButtonByText(component, "Remove")?.trigger("click");
    await flushPromises();

    expect(getChoices(surveyDocument.value, pointer).map(({ value }) => value)).toStrictEqual(["b"]);
  });

  test("declining leaves the row", async () => {
    expect.hasAssertions();
    const surveyCreatorStore = useSurveyCreatorStore();
    const { load } = surveyCreatorStore;
    load(createDocument(["a", "b"]));
    const { document: surveyDocument } = storeToRefs(surveyCreatorStore);

    const component = await mountSuspended(ResourceSurveyCreatorImageChoicesEditor, { props: { pointer } });
    await component.get('[aria-label="Remove choice 1"]').trigger("click");

    expect(component.findComponent(UiConfirmDialog).props("title")).toBe("Remove choice 1?");

    const cancelButton = getButtonByText(component, "Cancel");
    assert.exists(cancelButton);
    await cancelButton.trigger("click");
    await flushPromises();

    expect(getChoices(surveyDocument.value, pointer).map(({ value }) => value)).toStrictEqual(["a", "b"]);
  });

  test("a value that repeats another choice's value is flagged and not written, and the field keeps what was typed", async () => {
    expect.hasAssertions();
    const surveyCreatorStore = useSurveyCreatorStore();
    const { load } = surveyCreatorStore;
    load(createDocument(["a", "b"]));
    const { document: surveyDocument } = storeToRefs(surveyCreatorStore);

    const component = await mountSuspended(ResourceSurveyCreatorImageChoicesEditor, { props: { pointer } });
    const valueField = component
      .findAllComponents(UiTextField)
      .find((field) => field.props("label") === "Value of choice 2");
    valueField?.vm.$emit("update:modelValue", "a");
    await flushPromises();

    expect(getChoices(surveyDocument.value, pointer).map(({ value }) => value)).toStrictEqual(["a", "b"]);
    expect(valueField?.props("modelValue")).toBe("a");
    expect(valueField?.props("error")).toBe("Choice values must be unique");
  });

  // The editor opens on a picker with no choices, adds one from a picked image and removes it, and closes: the picture is
  // Then deleted
  test("an image added as a choice and removed in the session is deleted when the editor closes", async () => {
    expect.hasAssertions();
    const surveyCreatorStore = useSurveyCreatorStore();
    const { load } = surveyCreatorStore;
    load(createDocument([]));
    const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
    const { sweep, track } = useSurveyFiles();
    track(surveyDocument.value);
    const url = "b";
    uploadFile.mockResolvedValue(url);

    const component = await mountSuspended(ResourceSurveyCreatorImageChoicesEditor, { props: { pointer } });
    component.getComponent(UiFileField).vm.$emit("update:modelValue", [new File(["a"], "a")]);
    await flushPromises();
    await component.get('[aria-label="Remove choice 1"]').trigger("click");
    await getButtonByText(component, "Remove")?.trigger("click");
    await flushPromises();
    await sweep(surveyDocument.value);

    expect(getChoices(surveyDocument.value, pointer)).toStrictEqual([]);
    expect(deleteFile).toHaveBeenCalledExactlyOnceWith(url);
  });

  test("a picture that lands after its row is removed is reported, and written to no row", async () => {
    expect.hasAssertions();
    const surveyCreatorStore = useSurveyCreatorStore();
    const { load } = surveyCreatorStore;
    load(createDocument(["a", "b"]));
    const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const { promise, resolve } = Promise.withResolvers<string>();
    uploadFile.mockReturnValue(promise);

    const component = await mountSuspended(ResourceSurveyCreatorImageChoicesEditor, { props: { pointer } });
    component
      .findAllComponents(UiFileField)
      .find((field) => field.props("label") === "Replace image of choice 2")
      ?.vm.$emit("update:modelValue", [new File(["c"], "c")]);
    await component.get('[aria-label="Remove choice 2"]').trigger("click");
    await getButtonByText(component, "Remove")?.trigger("click");
    resolve("c");
    await flushPromises();

    expect(getChoices(surveyDocument.value, pointer).map(({ value }) => value)).toStrictEqual(["a"]);
    expect(alerts.value.map(({ text }) => text)).toStrictEqual(["The image could not be applied."]);
  });
});
