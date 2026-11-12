// @vitest-environment nuxt
import type { ArrowElement, ShapeElement } from "vue-block-editor-headless";

import ResourceWhiteboardEditorPropertiesArrange from "@/components/Resource/Whiteboard/EditorPropertiesArrange.vue";
import { createWhiteboardEditState, WHITEBOARD_ARROW, WHITEBOARD_PROCESS } from "@/services/whiteboard/constants.test";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceWhiteboardEditorPropertiesArrange", () => {
  const FIRST_ID = crypto.randomUUID();
  const SECOND_ID = crypto.randomUUID();
  const ARROW_ID = crypto.randomUUID();
  const ALIGN_LABELS = ["Align left", "Align centre", "Align right", "Align top", "Align middle", "Align bottom"];
  const DISTRIBUTE_LABELS = ["Distribute horizontally", "Distribute vertically"];
  const createShape = (id: string, x: number): ShapeElement => ({ ...WHITEBOARD_PROCESS, id, x });
  // A free arrow, which takes no part in an align or a distribute
  const FREE_ARROW: ArrowElement = { ...WHITEBOARD_ARROW, id: ARROW_ID, start: { point: { x: 500, y: 500 } } };

  test("Align and distribute are disabled with one box and an arrow selected", async () => {
    expect.hasAssertions();

    const whiteboardStore = useWhiteboardStore();
    const whiteboardEditorStore = useWhiteboardEditorStore();
    whiteboardStore.editState = createWhiteboardEditState({ elements: [createShape(FIRST_ID, 0), FREE_ARROW] });
    whiteboardEditorStore.selectedIds = [FIRST_ID, ARROW_ID];
    const wrapper = await mountSuspended(ResourceWhiteboardEditorPropertiesArrange);

    for (const label of [...ALIGN_LABELS, ...DISTRIBUTE_LABELS])
      expect(wrapper.get(`button[aria-label="${label}"]`).attributes("disabled")).toBe("");
  });

  test("Align is enabled with two boxes and distribute stays disabled below three", async () => {
    expect.hasAssertions();

    const whiteboardStore = useWhiteboardStore();
    const whiteboardEditorStore = useWhiteboardEditorStore();
    whiteboardStore.editState = createWhiteboardEditState({
      elements: [createShape(FIRST_ID, 0), createShape(SECOND_ID, 200)],
    });
    whiteboardEditorStore.selectedIds = [FIRST_ID, SECOND_ID];
    const wrapper = await mountSuspended(ResourceWhiteboardEditorPropertiesArrange);

    for (const label of ALIGN_LABELS)
      expect(wrapper.get(`button[aria-label="${label}"]`).attributes("disabled")).toBeUndefined();
    for (const label of DISTRIBUTE_LABELS)
      expect(wrapper.get(`button[aria-label="${label}"]`).attributes("disabled")).toBe("");
  });

  test("Aligning to the left edge from the panel is one edit", async () => {
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
