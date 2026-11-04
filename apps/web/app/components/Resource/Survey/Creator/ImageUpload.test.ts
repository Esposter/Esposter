// @vitest-environment nuxt
import type { SurveyDocument } from "headless-survey-engine";

import ResourceSurveyCreatorImageUpload from "@/components/Resource/Survey/Creator/ImageUpload.vue";
import UiFileField from "@/components/Ui/FileField.vue";
import { useSurveyFiles } from "@/composables/survey/useSurveyFiles";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { getBlockNode } from "headless-block-editor";
import { surveyDocumentSchema, surveyNodeChildren, SurveyNodeType } from "headless-survey-engine";
import { describe, expect, test, vi } from "vitest";

const { deleteFile, uploadFile } = vi.hoisted(() => ({
  deleteFile: vi.fn<(url: string) => Promise<void>>(() => Promise.resolve()),
  uploadFile: vi.fn<(file: File) => Promise<string>>(),
}));

vi.mock(import("@/composables/resource/useUploadResourceFile"), () => ({ useUploadResourceFile: () => uploadFile }));
vi.mock(import("@/composables/resource/useDeleteResourceFile"), () => ({ useDeleteResourceFile: () => deleteFile }));

// A survey whose one page holds one image question, of the given picture
const createDocument = (imageLink: string) =>
  surveyDocumentSchema.parse({
    content: [
      {
        props: {
          children: [{ props: { id: crypto.randomUUID(), imageLink, name: "image" }, type: SurveyNodeType.Image }],
          id: crypto.randomUUID(),
        },
        type: SurveyNodeType.Page,
      },
    ],
    root: { props: {} },
  });

const getImageLink = (document: SurveyDocument, pointer: string) => {
  const node = getBlockNode(document, pointer, surveyNodeChildren);
  return node?.type === SurveyNodeType.Image ? node.props.imageLink : undefined;
};

describe("resourceSurveyCreatorImageUpload", () => {
  const pointer = "/content/0/props/children/0";
  const url = "b";

  test("a picked image uploads, and its url is written to the image question at the pointer", async () => {
    expect.hasAssertions();
    const surveyCreatorStore = useSurveyCreatorStore();
    const { load } = surveyCreatorStore;
    load(createDocument(""));
    const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
    uploadFile.mockResolvedValue(url);

    const component = await mountSuspended(ResourceSurveyCreatorImageUpload, { props: { pointer } });
    component.getComponent(UiFileField).vm.$emit("update:modelValue", [new File(["a"], "a")]);
    await flushPromises();

    expect(getImageLink(surveyDocument.value, pointer)).toBe(url);
  });

  test("removing the image clears the url the question holds", async () => {
    expect.hasAssertions();
    const surveyCreatorStore = useSurveyCreatorStore();
    const { load } = surveyCreatorStore;
    load(createDocument(url));
    const { document: surveyDocument } = storeToRefs(surveyCreatorStore);

    const component = await mountSuspended(ResourceSurveyCreatorImageUpload, { props: { pointer } });
    await component
      .findAll("button")
      .find((button) => button.text() === "Remove image")
      ?.trigger("click");
    await flushPromises();

    expect(getImageLink(surveyDocument.value, pointer)).toBe("");
  });

  // The editor opens on a question with no picture, uploads one, removes it, and closes: the picture is then deleted
  test("an image uploaded and removed in the session is deleted when the editor closes", async () => {
    expect.hasAssertions();
    const surveyCreatorStore = useSurveyCreatorStore();
    const { load } = surveyCreatorStore;
    load(createDocument(""));
    const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
    const { sweep, track } = useSurveyFiles();
    track(surveyDocument.value);
    uploadFile.mockResolvedValue(url);

    const component = await mountSuspended(ResourceSurveyCreatorImageUpload, { props: { pointer } });
    component.getComponent(UiFileField).vm.$emit("update:modelValue", [new File(["a"], "a")]);
    await flushPromises();
    await component
      .findAll("button")
      .find((button) => button.text() === "Remove image")
      ?.trigger("click");
    await flushPromises();
    await sweep(surveyDocument.value);

    expect(deleteFile).toHaveBeenCalledExactlyOnceWith(url);
  });
});
