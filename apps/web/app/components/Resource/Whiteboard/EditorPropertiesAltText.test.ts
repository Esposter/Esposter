// @vitest-environment nuxt
import type { ImageElement } from "vue-block-editor-headless";

import ResourceWhiteboardEditorPropertiesAltText from "@/components/Resource/Whiteboard/EditorPropertiesAltText.vue";
import { createWhiteboardEditState } from "@/services/whiteboard/constants.test";
import { createWhiteboardImageElement } from "@/services/whiteboard/createWhiteboardImageElement";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceWhiteboardEditorPropertiesAltText", () => {
  const FILE_ID = "0".repeat(64);

  test("enter commits the alt text as one edit", async () => {
    expect.hasAssertions();

    const image = createWhiteboardImageElement(FILE_ID, { x: 0, y: 0 });
    const whiteboardStore = useWhiteboardStore();
    whiteboardStore.editState = createWhiteboardEditState({ elements: [image] });
    const panel = await mountSuspended(ResourceWhiteboardEditorPropertiesAltText, {
      props: { element: image, index: 0 },
    });

    await panel.get("input").setValue("Quarterly chart");
    await panel.get("input").trigger("keydown.enter");

    expect(whiteboardStore.editState.document).toStrictEqual({ elements: [{ ...image, altText: "Quarterly chart" }] });
  });

  test("leaving the field with its alt text unchanged makes no edit", async () => {
    expect.hasAssertions();

    const image = createWhiteboardImageElement(FILE_ID, { x: 0, y: 0 });
    const whiteboardStore = useWhiteboardStore();
    whiteboardStore.editState = createWhiteboardEditState({ elements: [image] });
    const editStateBefore = whiteboardStore.editState;
    const panel = await mountSuspended(ResourceWhiteboardEditorPropertiesAltText, {
      props: { element: image, index: 0 },
    });

    await panel.get("input").trigger("focusout");

    expect(whiteboardStore.editState).toBe(editStateBefore);
  });

  test("an undo that changes the stored alt text shows in the field", async () => {
    expect.hasAssertions();

    const image = createWhiteboardImageElement(FILE_ID, { x: 0, y: 0 });
    const namedImage: ImageElement = { ...image, altText: "Quarterly chart" };
    const panel = await mountSuspended(ResourceWhiteboardEditorPropertiesAltText, {
      props: { element: namedImage, index: 0 },
    });

    expect((panel.get("input").element as HTMLInputElement).value).toBe("Quarterly chart");

    await panel.setProps({ element: image });

    expect((panel.get("input").element as HTMLInputElement).value).toBe("");
  });
});
