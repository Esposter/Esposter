// @vitest-environment nuxt
import type { SurveyDocument } from "survey-engine";

import ResourceSurveyCreatorImageChoicesEditor from "@/components/Resource/Survey/Creator/ImageChoicesEditor.vue";
import UiFileField from "@/components/Ui/FileField.vue";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { getBlockNode } from "headless-block-editor";
import { SurveyNodeType, surveyDocumentSchema, surveyNodeChildren } from "survey-engine";
import { describe, expect, test, vi } from "vitest";

const { uploadFile } = vi.hoisted(() => ({ uploadFile: vi.fn<(file: File) => Promise<string>>() }));

vi.mock(import("@/composables/resource/useUploadResourceFile"), () => ({ useUploadResourceFile: () => uploadFile }));

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
                id: crypto.randomUUID(),
                name: "picker",
              },
              type: SurveyNodeType.ImagePicker,
            },
          ],
          id: crypto.randomUUID(),
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

    expect(getChoices(surveyDocument.value, pointer)).toStrictEqual([
      { imageLink: url, text: "", value: expect.any(String) },
    ]);
  });

  test("moving a choice down swaps it with the choice after it", async () => {
    expect.hasAssertions();
    const surveyCreatorStore = useSurveyCreatorStore();
    const { load } = surveyCreatorStore;
    load(createDocument(["a", "b"]));
    const { document: surveyDocument } = storeToRefs(surveyCreatorStore);

    const component = await mountSuspended(ResourceSurveyCreatorImageChoicesEditor, { props: { pointer } });
    component.get('[aria-label="Move choice 1 down"]').trigger("click");
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
    component.get('[aria-label="Remove choice 1"]').trigger("click");
    await flushPromises();

    expect(getChoices(surveyDocument.value, pointer).map(({ value }) => value)).toStrictEqual(["b"]);
  });
});
