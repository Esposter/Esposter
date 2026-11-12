// @vitest-environment nuxt
import type { ImageElement } from "vue-block-editor-headless";

import ResourceWhiteboardEditorPropertiesAltText from "@/components/Resource/Whiteboard/EditorPropertiesAltText.vue";
import ResourceWhiteboardElementImage from "@/components/Resource/Whiteboard/ElementImage.vue";
import { createWhiteboardEditState } from "@/services/whiteboard/constants.test";
import { createWhiteboardImageElement } from "@/services/whiteboard/createWhiteboardImageElement";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceWhiteboardElementImage", () => {
  const FILE_ID = "0".repeat(64);

  test("setting alt text from the properties panel names the image", async () => {
    expect.hasAssertions();

    const image = createWhiteboardImageElement(FILE_ID, { x: 0, y: 0 });
    const whiteboardStore = useWhiteboardStore();
    whiteboardStore.editState = createWhiteboardEditState({ elements: [image] });
    const panel = await mountSuspended(ResourceWhiteboardEditorPropertiesAltText, {
      props: { element: image, index: 0 },
    });

    await panel.get("input").setValue("Quarterly chart");
    await panel.get("input").trigger("focusout");

    const namedImage: ImageElement = { ...image, altText: "Quarterly chart" };
    expect(whiteboardStore.editState.document).toStrictEqual({ elements: [namedImage] });
    const canvasImage = await mountSuspended(ResourceWhiteboardElementImage, { props: { image: namedImage } });
    expect(canvasImage.get("image").attributes("role")).toBe("img");
    expect(canvasImage.get("image").attributes("aria-label")).toBe("Quarterly chart");
  });

  test("a new image starts with no alt text", async () => {
    expect.hasAssertions();

    const image = createWhiteboardImageElement(FILE_ID, { x: 0, y: 0 });
    const whiteboardStore = useWhiteboardStore();
    whiteboardStore.editState = createWhiteboardEditState({ elements: [image] });
    const panel = await mountSuspended(ResourceWhiteboardEditorPropertiesAltText, {
      props: { element: image, index: 0 },
    });
    const canvasImage = await mountSuspended(ResourceWhiteboardElementImage, { props: { image } });

    expect((panel.get("input").element as HTMLInputElement).value).toBe("");
    expect(canvasImage.get("image").attributes("aria-label")).toBeUndefined();
  });
});
