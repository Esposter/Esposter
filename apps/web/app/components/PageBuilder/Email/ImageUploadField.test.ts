// @vitest-environment nuxt
import { TEST_ID, TEST_OTHER_ID, TEST_THIRD_ID } from "#shared/services/pageBuilder/constants.test";
import PageBuilderEmailImageUploadField from "@/components/PageBuilder/Email/ImageUploadField.vue";
import UiFileField from "@/components/Ui/FileField.vue";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

const { assetUrl, upload } = vi.hoisted(() => ({ assetUrl: "a", upload: { result: Promise.resolve("a") } }));
vi.mock(import("@/composables/resource/useUploadResourceFile"), () => ({
  useUploadResourceFile: () => () => upload.result,
}));

describe("pageBuilderEmailImageUploadField", () => {
  const TEST_IMAGE_FILE_NAME = "a";

  test("a picked image uploads, and its asset url is emitted as the source of the node selected when it was picked", async () => {
    expect.hasAssertions();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(TEST_ID, TEST_OTHER_ID);

    const component = await mountSuspended(PageBuilderEmailImageUploadField, { props: { resourceId: TEST_ID } });
    component.getComponent(UiFileField).vm.$emit("update:modelValue", [new File([], TEST_IMAGE_FILE_NAME)]);
    await flushPromises();

    expect(component.emitted("update")).toStrictEqual([[assetUrl, TEST_OTHER_ID]]);
  });

  test("an upload that lands after the selection moved still names the node its image was picked for", async () => {
    expect.hasAssertions();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(TEST_ID, TEST_OTHER_ID);
    const { promise, resolve } = Promise.withResolvers<string>();
    upload.result = promise;

    const component = await mountSuspended(PageBuilderEmailImageUploadField, { props: { resourceId: TEST_ID } });
    component.getComponent(UiFileField).vm.$emit("update:modelValue", [new File([], TEST_IMAGE_FILE_NAME)]);
    pageBuilderCanvasStore.setSelectedNodeId(TEST_ID, TEST_THIRD_ID);
    resolve(assetUrl);
    await flushPromises();

    expect(component.emitted("update")).toStrictEqual([[assetUrl, TEST_OTHER_ID]]);
  });
});
