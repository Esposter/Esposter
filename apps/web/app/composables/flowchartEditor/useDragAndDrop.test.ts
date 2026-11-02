// @vitest-environment nuxt
import { useDragAndDrop } from "@/composables/flowchartEditor/useDragAndDrop";
import { useDragStore } from "@/store/flowchartEditor/drag";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@vue-flow/core"), async (importOriginal) => ({
  ...(await importOriginal()),
  useVueFlow: () => ({
    addNodes: vi.fn<() => void>(),
    onNodesInitialized: vi.fn<() => void>(),
    screenToFlowCoordinate: vi.fn<() => void>(),
    updateNode: vi.fn<() => void>(),
  }),
}));

describe(useDragAndDrop, () => {
  // A palette drag cancelled, or released off a target that accepts it, fires dragend on its source and never a drop
  test("ends the drag on dragend, so a drag that is not dropped does not hold text selection off", () => {
    expect.hasAssertions();

    const dragStore = useDragStore();
    const { onDragStart } = useDragAndDrop();
    onDragStart(new DragEvent("dragstart"));

    expect(dragStore.isDragging).toBe(true);

    window.document.dispatchEvent(new DragEvent("dragend"));

    expect(dragStore.isDragging).toBe(false);
  });
});
