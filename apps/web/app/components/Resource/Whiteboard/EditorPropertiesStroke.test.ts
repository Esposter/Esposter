// @vitest-environment nuxt
import type { ShapeElement } from "vue-block-editor-headless";

import ResourceWhiteboardEditorPropertiesStroke from "@/components/Resource/Whiteboard/EditorPropertiesStroke.vue";
import { createWhiteboardEditState, WHITEBOARD_PROCESS } from "@/services/whiteboard/constants.test";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { assert, describe, expect, test } from "vitest";
import { StrokeWidth } from "vue-block-editor-headless";

describe("resourceWhiteboardEditorPropertiesStroke", () => {
  test("clearing a colour returns the element to the page text colour", async () => {
    expect.hasAssertions();

    const whiteboardStore = useWhiteboardStore();
    const shape: ShapeElement = { ...WHITEBOARD_PROCESS, color: "#ff0000" };
    whiteboardStore.editState = createWhiteboardEditState({ elements: [shape] });
    const wrapper = await mountSuspended(ResourceWhiteboardEditorPropertiesStroke, {
      props: { element: shape, index: 0 },
    });

    const clearColourButton = wrapper.findAll("button").find((button) => button.text() === "Clear colour");
    assert.exists(clearColourButton);
    await clearColourButton.trigger("click");

    expect(whiteboardStore.editState.document).toStrictEqual({ elements: [{ ...shape, color: "" }] });
  });

  test("a bold width draws the outline and the export at bold", async () => {
    expect.hasAssertions();

    const whiteboardStore = useWhiteboardStore();
    whiteboardStore.editState = createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS] });
    const wrapper = await mountSuspended(ResourceWhiteboardEditorPropertiesStroke, {
      props: { element: WHITEBOARD_PROCESS, index: 0 },
    });

    const boldButton = wrapper.findAll("button").find((button) => button.text() === "Bold");
    assert.exists(boldButton);
    await boldButton.trigger("click");

    expect(whiteboardStore.editState.document).toStrictEqual({
      elements: [{ ...WHITEBOARD_PROCESS, strokeWidth: StrokeWidth.Bold }],
    });
  });
});
