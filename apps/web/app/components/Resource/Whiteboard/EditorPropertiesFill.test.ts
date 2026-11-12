// @vitest-environment nuxt
import type { ShapeElement } from "vue-block-editor-headless";

import ResourceWhiteboardEditorPropertiesFill from "@/components/Resource/Whiteboard/EditorPropertiesFill.vue";
import { createWhiteboardEditState, WHITEBOARD_PROCESS } from "@/services/whiteboard/constants.test";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { assert, describe, expect, test } from "vitest";

describe("resourceWhiteboardEditorPropertiesFill", () => {
  test("clearing a shape fill leaves it open", async () => {
    expect.hasAssertions();

    const whiteboardStore = useWhiteboardStore();
    const shape: ShapeElement = { ...WHITEBOARD_PROCESS, fill: "#0000ff" };
    whiteboardStore.editState = createWhiteboardEditState({ elements: [shape] });
    const wrapper = await mountSuspended(ResourceWhiteboardEditorPropertiesFill, {
      props: { element: shape, index: 0 },
    });

    const noFillButton = wrapper.findAll("button").find((button) => button.text() === "No fill");
    assert.exists(noFillButton);
    await noFillButton.trigger("click");

    expect(whiteboardStore.editState.document).toStrictEqual({ elements: [{ ...shape, fill: "" }] });
  });
});
