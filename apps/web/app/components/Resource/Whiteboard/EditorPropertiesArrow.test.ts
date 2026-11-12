// @vitest-environment nuxt
import type { ArrowElement } from "vue-block-editor-headless";

import ResourceWhiteboardEditorPropertiesArrow from "@/components/Resource/Whiteboard/EditorPropertiesArrow.vue";
import { createWhiteboardEditState, WHITEBOARD_ARROW, WHITEBOARD_PROCESS } from "@/services/whiteboard/constants.test";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { assert, describe, expect, test } from "vitest";
import { ArrowheadKind } from "vue-block-editor-headless";

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
      elements: [WHITEBOARD_PROCESS, { ...WHITEBOARD_ARROW, start: { point: { x: 50, y: 100 } } }],
    });
  });

  test("an arrow takes a different arrowhead at each end", async () => {
    expect.hasAssertions();

    const whiteboardStore = useWhiteboardStore();
    const arrow: ArrowElement = {
      ...WHITEBOARD_ARROW,
      end: { point: { x: 150, y: 250 } },
      start: { point: { x: 50, y: 100 } },
    };
    whiteboardStore.editState = createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS, arrow] });
    const wrapper = await mountSuspended(ResourceWhiteboardEditorPropertiesArrow, { props: { arrow, index: 1 } });

    // Checking an end's box sets its triangle, and the head choice for that end appears beside it
    await wrapper.get('[role="checkbox"][aria-label="Arrowhead at start"]').trigger("click");
    await wrapper.setProps({
      arrow: { ...arrow, start: { arrowhead: ArrowheadKind.Triangle, point: { x: 50, y: 100 } } },
    });
    const startCircleButton = wrapper
      .get('[role="radiogroup"][aria-label="Start head"]')
      .findAll("button")
      .find((button) => button.text() === "Circle");
    assert.exists(startCircleButton);
    await startCircleButton.trigger("click");

    await wrapper.get('[role="checkbox"][aria-label="Arrowhead at end"]').trigger("click");
    await wrapper.setProps({
      arrow: {
        ...arrow,
        end: { arrowhead: ArrowheadKind.Triangle, point: { x: 150, y: 250 } },
        start: { arrowhead: ArrowheadKind.Circle, point: { x: 50, y: 100 } },
      },
    });
    const endDiamondButton = wrapper
      .get('[role="radiogroup"][aria-label="End head"]')
      .findAll("button")
      .find((button) => button.text() === "Diamond");
    assert.exists(endDiamondButton);
    await endDiamondButton.trigger("click");

    expect(whiteboardStore.editState.document).toStrictEqual({
      elements: [
        WHITEBOARD_PROCESS,
        {
          ...arrow,
          end: { arrowhead: ArrowheadKind.Diamond, point: { x: 150, y: 250 } },
          start: { arrowhead: ArrowheadKind.Circle, point: { x: 50, y: 100 } },
        },
      ],
    });
  });
});
