// @vitest-environment nuxt
import type { ShapeElement } from "vue-block-editor-headless";

import ResourceWhiteboardEditorPropertiesSeveralPanel from "#src/components/Resource/Whiteboard/Editor/Properties/SeveralPanel.vue";
import { createWhiteboardEditState, WHITEBOARD_PROCESS } from "#src/services/whiteboard/constants.test";
import { useWhiteboardEditorStore } from "#src/store/resource/whiteboard/editor";
import { useWhiteboardStore } from "#src/store/resource/whiteboard/index";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { assert, describe, expect, test } from "vitest";

describe("resourceWhiteboardEditorPropertiesSeveralPanel", () => {
  test("no fill clears the fill of every selected shape in one edit", async () => {
    expect.hasAssertions();

    const whiteboardStore = useWhiteboardStore();
    const { editState } = storeToRefs(whiteboardStore);
    const whiteboardEditorStore = useWhiteboardEditorStore();
    const { selectedIds } = storeToRefs(whiteboardEditorStore);
    const first: ShapeElement = { ...WHITEBOARD_PROCESS, fill: "#0000ff", id: v7() };
    const second: ShapeElement = { ...WHITEBOARD_PROCESS, fill: "#ff0000", id: v7(), x: 200 };
    editState.value = createWhiteboardEditState({ elements: [first, second] });
    selectedIds.value = [first.id, second.id];
    const wrapper = await mountSuspended(ResourceWhiteboardEditorPropertiesSeveralPanel);

    const noFillButton = wrapper.findAll("button").find((button) => button.text() === "No fill");
    assert.exists(noFillButton);
    await noFillButton.trigger("click");

    expect(editState.value.document).toStrictEqual({
      elements: [
        { ...first, fill: "" },
        { ...second, fill: "" },
      ],
    });
    expect(editState.value.history.past).toHaveLength(1);
  });

  test("bring forward moves the selection of several past the element above it in one edit", async () => {
    expect.hasAssertions();

    const whiteboardStore = useWhiteboardStore();
    const { editState } = storeToRefs(whiteboardStore);
    const whiteboardEditorStore = useWhiteboardEditorStore();
    const { selectedIds } = storeToRefs(whiteboardEditorStore);
    const first: ShapeElement = { ...WHITEBOARD_PROCESS, id: v7() };
    const second: ShapeElement = { ...WHITEBOARD_PROCESS, id: v7(), x: 200 };
    const third: ShapeElement = { ...WHITEBOARD_PROCESS, id: v7(), x: 400 };
    editState.value = createWhiteboardEditState({ elements: [first, second, third] });
    selectedIds.value = [first.id, second.id];
    const wrapper = await mountSuspended(ResourceWhiteboardEditorPropertiesSeveralPanel);

    await wrapper.get('button[aria-label="Bring forward"]').trigger("click");

    expect(editState.value.document.elements).toStrictEqual([third, first, second]);
    expect(editState.value.history.past).toHaveLength(1);
  });
});
