// @vitest-environment nuxt
import type { ArrowElement, ShapeElement } from "vue-block-editor-headless";

import ResourceWhiteboardEditorPropertiesArrange from "#src/components/Resource/Whiteboard/Editor/Properties/Arrange.vue";
import {
  createWhiteboardEditState,
  WHITEBOARD_ARROW,
  WHITEBOARD_PROCESS,
} from "#src/services/whiteboard/constants.test";
import { useWhiteboardEditorStore } from "#src/store/resource/whiteboard/editor";
import { useWhiteboardStore } from "#src/store/resource/whiteboard/index";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

const createShape = (id: string, x: number): ShapeElement => ({ ...WHITEBOARD_PROCESS, id, x });

describe("resourceWhiteboardEditorPropertiesArrange", () => {
  const FIRST_ID = v7();
  const SECOND_ID = v7();
  const ARROW_ID = v7();
  const ALIGN_LABELS = ["Align left", "Align centre", "Align right", "Align top", "Align middle", "Align bottom"];
  const DISTRIBUTE_LABELS = ["Distribute horizontally", "Distribute vertically"];
  // A free arrow, which takes no part in an align or a distribute
  const FREE_ARROW: ArrowElement = { ...WHITEBOARD_ARROW, id: ARROW_ID, start: { point: { x: 500, y: 500 } } };

  test("align and distribute are disabled with one box and an arrow selected", async () => {
    expect.hasAssertions();

    const whiteboardStore = useWhiteboardStore();
    const whiteboardEditorStore = useWhiteboardEditorStore();
    whiteboardStore.editState = createWhiteboardEditState({ elements: [createShape(FIRST_ID, 0), FREE_ARROW] });
    whiteboardEditorStore.selectedIds = [FIRST_ID, ARROW_ID];
    const wrapper = await mountSuspended(ResourceWhiteboardEditorPropertiesArrange);

    for (const label of [...ALIGN_LABELS, ...DISTRIBUTE_LABELS])
      expect(wrapper.get(`button[aria-label="${label}"]`).attributes("disabled")).toBe("");
  });

  test("align is enabled where two boxes differ and disabled where they already line up, and distribute stays disabled below three", async () => {
    expect.hasAssertions();

    const whiteboardStore = useWhiteboardStore();
    const whiteboardEditorStore = useWhiteboardEditorStore();
    whiteboardStore.editState = createWhiteboardEditState({
      elements: [createShape(FIRST_ID, 0), createShape(SECOND_ID, 200)],
    });
    whiteboardEditorStore.selectedIds = [FIRST_ID, SECOND_ID];
    const wrapper = await mountSuspended(ResourceWhiteboardEditorPropertiesArrange);

    // The two shapes differ in x alone, so the left, centre and right edges would move one and the top, middle and bottom edges already line up
    for (const label of ALIGN_LABELS.slice(0, 3))
      expect(wrapper.get(`button[aria-label="${label}"]`).attributes("disabled")).toBeUndefined();
    for (const label of ALIGN_LABELS.slice(3))
      expect(wrapper.get(`button[aria-label="${label}"]`).attributes("disabled")).toBe("");
    for (const label of DISTRIBUTE_LABELS)
      expect(wrapper.get(`button[aria-label="${label}"]`).attributes("disabled")).toBe("");
  });

  test("aligning to the left edge from the panel is one edit", async () => {
    expect.hasAssertions();

    const whiteboardStore = useWhiteboardStore();
    const whiteboardEditorStore = useWhiteboardEditorStore();
    const second = createShape(SECOND_ID, 200);
    whiteboardStore.editState = createWhiteboardEditState({ elements: [createShape(FIRST_ID, 0), second] });
    whiteboardEditorStore.selectedIds = [FIRST_ID, SECOND_ID];
    const wrapper = await mountSuspended(ResourceWhiteboardEditorPropertiesArrange);

    await wrapper.get('button[aria-label="Align left"]').trigger("click");

    expect(whiteboardStore.editState.document.elements).toStrictEqual([
      createShape(FIRST_ID, 0),
      createShape(SECOND_ID, 0),
    ]);
    expect(whiteboardStore.editState.history.past).toHaveLength(1);
  });
});
