// @vitest-environment nuxt
import ResourceWhiteboardEditorPropertiesArrow from "@/components/Resource/Whiteboard/EditorPropertiesArrow.vue";
import { createWhiteboardEditState, WHITEBOARD_ARROW, WHITEBOARD_PROCESS } from "@/services/whiteboard/constants.test";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { assert, describe, expect, test } from "vitest";

describe("resourceWhiteboardEditorPropertiesArrow", () => {
  test("detaching a bound arrow end frees it where it was", async () => {
    expect.hasAssertions();

    const whiteboardStore = useWhiteboardStore();
    whiteboardStore.editState = createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS, WHITEBOARD_ARROW] });
    const wrapper = await mountSuspended(ResourceWhiteboardEditorPropertiesArrow, {
      props: { arrow: WHITEBOARD_ARROW, index: 1 },
    });

    // Only the start is bound to a shape, so only the start has a detach control
    const detachLabels = wrapper
      .findAll("button")
      .map((button) => button.text())
      .filter((text) => text.startsWith("Detach"));
    expect(detachLabels).toStrictEqual(["Detach start"]);

    const detachStartButton = wrapper.findAll("button").find((button) => button.text() === "Detach start");
    assert.exists(detachStartButton);
    await detachStartButton.trigger("click");

    // The start is free and stays at its point, and the rest of the arrow is untouched
    expect(whiteboardStore.editState.document).toStrictEqual({
      elements: [WHITEBOARD_PROCESS, { ...WHITEBOARD_ARROW, start: { hasArrowhead: false, point: { x: 50, y: 100 } } }],
    });
  });
});
