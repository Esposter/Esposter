// @vitest-environment nuxt
import type { ShapeElement } from "vue-block-editor-headless";

import ResourceWhiteboardEditorPropertiesSeveralPanel from "@/components/Resource/Whiteboard/EditorPropertiesSeveralPanel.vue";
import { createWhiteboardEditState, WHITEBOARD_PROCESS } from "@/services/whiteboard/constants.test";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { assert, describe, expect, test } from "vitest";

describe("resourceWhiteboardEditorPropertiesSeveralPanel", () => {
  test("No fill clears the fill of every selected shape in one edit", async () => {
    expect.hasAssertions();

    const whiteboardStore = useWhiteboardStore();
    const whiteboardEditorStore = useWhiteboardEditorStore();
    const first: ShapeElement = { ...WHITEBOARD_PROCESS, fill: "#0000ff", id: crypto.randomUUID() };
    const second: ShapeElement = { ...WHITEBOARD_PROCESS, fill: "#ff0000", id: crypto.randomUUID(), x: 200 };
    whiteboardStore.editState = createWhiteboardEditState({ elements: [first, second] });
    whiteboardEditorStore.selectedIds = [first.id, second.id];
    const wrapper = await mountSuspended(ResourceWhiteboardEditorPropertiesSeveralPanel);

    const noFillButton = wrapper.findAll("button").find((button) => button.text() === "No fill");
    assert.exists(noFillButton);
    await noFillButton.trigger("click");

    expect(whiteboardStore.editState.document).toStrictEqual({
      elements: [
        { ...first, fill: "" },
        { ...second, fill: "" },
      ],
    });
    expect(whiteboardStore.editState.history.past).toHaveLength(1);
  });
});
