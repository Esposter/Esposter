// @vitest-environment nuxt
import { TEST_ID } from "#shared/services/pageBuilder/constants.test";
import PageBuilderEmailImageUploadField from "@/components/PageBuilder/Email/ImageUploadField.vue";
import UiFileField from "@/components/Ui/FileField.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

const { assetUrl } = vi.hoisted(() => ({ assetUrl: "https://assets.example/image" }));
vi.mock(import("@/composables/resource/useUploadResourceFile"), () => ({
  useUploadResourceFile: () => () => Promise.resolve(assetUrl),
}));

describe("pageBuilderEmailImageUploadField", () => {
  const TEST_IMAGE_FILE_NAME = "a";

  test("a picked image uploads, and its asset url is emitted as the source", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(PageBuilderEmailImageUploadField, { props: { resourceId: TEST_ID } });
    component.getComponent(UiFileField).vm.$emit("update:modelValue", [new File([], TEST_IMAGE_FILE_NAME)]);
    await flushPromises();

    expect(component.emitted("update")).toStrictEqual([[assetUrl]]);
  });
});
