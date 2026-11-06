// @vitest-environment nuxt
import type { WhiteboardEditState } from "@/models/whiteboard/WhiteboardEditState";

import { useWhiteboardKeyboard } from "@/composables/whiteboard/useWhiteboardKeyboard";
import { GestureTool } from "@/models/whiteboard/GestureTool";
import {
  createWhiteboardEditState,
  pressKey,
  WHITEBOARD_ARROW,
  WHITEBOARD_PROCESS,
  WHITEBOARD_PROCESS_ID,
} from "@/services/whiteboard/constants.test";
import { applyWhiteboardEdit } from "@/services/whiteboard/edit/applyWhiteboardEdit";
import { WHITEBOARD_DUPLICATE_OFFSET } from "@/services/whiteboard/edit/constants";
import { getMoveOperations } from "@/services/whiteboard/gesture/getMoveOperations";
import { WHITEBOARD_NUDGE_LARGE_STEP, WHITEBOARD_NUDGE_STEP } from "@/services/whiteboard/keyboard/constants";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, onTestFinished, test } from "vitest";
import { ShapeKind } from "vue-block-editor-headless";

// The keyboard mounted as a surface, so its commands are bound for as long as the mount lasts and unbound when it unmounts
const mountKeyboard = (
  editState: Ref<WhiteboardEditState>,
  selectedIds: Ref<string[]>,
  deletingIds: Ref<string[]>,
  tool: Ref<GestureTool> = ref(GestureTool.Select),
  shapeKind: Ref<ShapeKind> = ref(ShapeKind.Rectangle),
) =>
  mountSuspended(
    defineComponent({
      render: () => h("div"),
      setup: () => useWhiteboardKeyboard(editState, selectedIds, deletingIds, tool, shapeKind),
    }),
  );

describe(useWhiteboardKeyboard, () => {
  test.each(["Delete", "Backspace"])(
    "deleting a shape from the canvas asks first and then removes its arrows, with the %s key",
    async (key) => {
      expect.hasAssertions();

      const document = { elements: [WHITEBOARD_PROCESS, WHITEBOARD_ARROW] };
      const editState = ref(createWhiteboardEditState(document));
      const selectedIds = ref([WHITEBOARD_PROCESS_ID]);
      const deletingIds = ref<string[]>([]);
      const keyboard = await mountKeyboard(editState, selectedIds, deletingIds);

      pressKey({ bubbles: true, key });

      expect(deletingIds.value).toStrictEqual([WHITEBOARD_PROCESS_ID]);
      expect(editState.value.document).toStrictEqual(document);

      keyboard.vm.confirmDelete();

      expect(editState.value.document).toStrictEqual({ elements: [] });
    },
  );

  test("a confirmed delete drops the deleted shape from the selection, so the next Delete asks about nothing", async () => {
    expect.hasAssertions();

    const document = { elements: [WHITEBOARD_PROCESS, WHITEBOARD_ARROW] };
    const editState = ref(createWhiteboardEditState(document));
    const selectedIds = ref([WHITEBOARD_PROCESS_ID]);
    const deletingIds = ref<string[]>([]);
    const keyboard = await mountKeyboard(editState, selectedIds, deletingIds);

    pressKey({ bubbles: true, key: "Delete" });
    keyboard.vm.confirmDelete();
    // The confirmation dialog clears its target as it closes on the answer
    deletingIds.value = [];
    await nextTick();
    pressKey({ bubbles: true, key: "Delete" });

    expect(selectedIds.value).toStrictEqual([]);
    expect(deletingIds.value).toStrictEqual([]);
  });

  test("escape clears the selection", async () => {
    expect.hasAssertions();

    const editState = ref(createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS] }));
    const selectedIds = ref([WHITEBOARD_PROCESS_ID]);
    const deletingIds = ref<string[]>([]);
    await mountKeyboard(editState, selectedIds, deletingIds);

    pressKey({ bubbles: true, key: "Escape" });

    expect(selectedIds.value).toStrictEqual([]);
  });

  test("ctrl with Z reverts the last edit", async () => {
    expect.hasAssertions();

    const document = { elements: [WHITEBOARD_PROCESS, WHITEBOARD_ARROW] };
    const editState = ref(
      applyWhiteboardEdit(
        createWhiteboardEditState(document),
        getMoveOperations(document, [WHITEBOARD_PROCESS_ID], { x: 10, y: 0 }, false),
      ),
    );
    const selectedIds = ref<string[]>([]);
    const deletingIds = ref<string[]>([]);
    await mountKeyboard(editState, selectedIds, deletingIds);

    pressKey({ bubbles: true, ctrlKey: true, key: "z" });

    expect(editState.value.document).toStrictEqual(document);
  });

  test.each([
    { init: { ctrlKey: true, key: "y", shiftKey: false }, title: "Y" },
    { init: { ctrlKey: true, key: "Z", shiftKey: true }, title: "Shift and Z" },
  ])("ctrl with $title redoes the undone edit", async ({ init }) => {
    expect.hasAssertions();

    const document = { elements: [WHITEBOARD_PROCESS] };
    const movedDocument = { elements: [{ ...WHITEBOARD_PROCESS, x: 10 }] };
    const editState = ref(
      applyWhiteboardEdit(
        createWhiteboardEditState(document),
        getMoveOperations(document, [WHITEBOARD_PROCESS_ID], { x: 10, y: 0 }, false),
      ),
    );
    const selectedIds = ref<string[]>([]);
    const deletingIds = ref<string[]>([]);
    await mountKeyboard(editState, selectedIds, deletingIds);

    pressKey({ bubbles: true, ctrlKey: true, key: "z" });
    pressKey({ bubbles: true, ...init });

    expect(editState.value.document).toStrictEqual(movedDocument);
  });

  test("an arrow key nudges the selection, and an arrow bound to a moved shape reroutes in the same edit", async () => {
    expect.hasAssertions();

    const editState = ref(createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS, WHITEBOARD_ARROW] }));
    const selectedIds = ref([WHITEBOARD_PROCESS_ID]);
    const deletingIds = ref<string[]>([]);
    await mountKeyboard(editState, selectedIds, deletingIds);

    pressKey({ bubbles: true, key: "ArrowRight" });

    expect(editState.value.document).toStrictEqual({
      elements: [
        { ...WHITEBOARD_PROCESS, x: WHITEBOARD_NUDGE_STEP },
        {
          ...WHITEBOARD_ARROW,
          start: {
            ...WHITEBOARD_ARROW.start,
            point: { x: WHITEBOARD_ARROW.start.point.x + WHITEBOARD_NUDGE_STEP, y: WHITEBOARD_ARROW.start.point.y },
          },
        },
      ],
    });
  });

  test("shift with an arrow key nudges the selection by the large step", async () => {
    expect.hasAssertions();

    const editState = ref(createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS] }));
    const selectedIds = ref([WHITEBOARD_PROCESS_ID]);
    const deletingIds = ref<string[]>([]);
    await mountKeyboard(editState, selectedIds, deletingIds);

    pressKey({ bubbles: true, key: "ArrowDown", shiftKey: true });

    expect(editState.value.document).toStrictEqual({
      elements: [{ ...WHITEBOARD_PROCESS, y: WHITEBOARD_NUDGE_LARGE_STEP }],
    });
  });

  test("ctrl with D duplicates the selection and selects the copy", async () => {
    expect.hasAssertions();

    const editState = ref(createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS] }));
    const selectedIds = ref([WHITEBOARD_PROCESS_ID]);
    const deletingIds = ref<string[]>([]);
    await mountKeyboard(editState, selectedIds, deletingIds);

    pressKey({ bubbles: true, ctrlKey: true, key: "d" });

    const copy = takeOne(editState.value.document.elements, 1);

    expect(selectedIds.value).toStrictEqual([copy.id]);
    expect(copy).toStrictEqual({
      ...WHITEBOARD_PROCESS,
      id: copy.id,
      x: WHITEBOARD_DUPLICATE_OFFSET,
      y: WHITEBOARD_DUPLICATE_OFFSET,
    });
  });

  test("a key typed into a text field is no whiteboard key", async () => {
    expect.hasAssertions();

    const input = document.createElement("input");
    document.body.append(input);
    onTestFinished(() => {
      input.remove();
    });
    input.focus();
    const editState = ref(createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS] }));
    const selectedIds = ref([WHITEBOARD_PROCESS_ID]);
    const deletingIds = ref<string[]>([]);
    await mountKeyboard(editState, selectedIds, deletingIds);

    pressKey({ bubbles: true, key: "Delete" }, input);

    expect(deletingIds.value).toStrictEqual([]);
  });

  // The keys wait for the answer: Escape closing the dialog must not also clear the selection, and Undo must not act
  // Beneath the dialog. The bindings are re-read after the delete is asked, so the await is what makes the check real
  test("while the delete asks, Undo and Escape wait for its answer", async () => {
    expect.hasAssertions();

    const document = { elements: [WHITEBOARD_PROCESS] };
    const movedDocument = { elements: [{ ...WHITEBOARD_PROCESS, x: 10 }] };
    const editState = ref(
      applyWhiteboardEdit(
        createWhiteboardEditState(document),
        getMoveOperations(document, [WHITEBOARD_PROCESS_ID], { x: 10, y: 0 }, false),
      ),
    );
    const selectedIds = ref([WHITEBOARD_PROCESS_ID]);
    const deletingIds = ref<string[]>([]);
    await mountKeyboard(editState, selectedIds, deletingIds);

    pressKey({ bubbles: true, key: "Delete" });
    await nextTick();
    pressKey({ bubbles: true, ctrlKey: true, key: "z" });
    pressKey({ bubbles: true, key: "Escape" });

    expect(editState.value.document).toStrictEqual(movedDocument);
    expect(selectedIds.value).toStrictEqual([WHITEBOARD_PROCESS_ID]);
  });

  test("a tool shortcut switches the tool", async () => {
    expect.hasAssertions();

    const editState = ref(createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS] }));
    const selectedIds = ref<string[]>([]);
    const deletingIds = ref<string[]>([]);
    const tool = ref(GestureTool.Select);
    await mountKeyboard(editState, selectedIds, deletingIds, tool);

    pressKey({ bubbles: true, key: "a" });

    expect(tool.value).toBe(GestureTool.Arrow);
  });

  test("a shortcut typed into a text field is text", async () => {
    expect.hasAssertions();

    const textarea = document.createElement("textarea");
    document.body.append(textarea);
    onTestFinished(() => {
      textarea.remove();
    });
    textarea.focus();
    const editState = ref(createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS] }));
    const selectedIds = ref<string[]>([WHITEBOARD_PROCESS_ID]);
    const deletingIds = ref<string[]>([]);
    const tool = ref(GestureTool.Select);
    await mountKeyboard(editState, selectedIds, deletingIds, tool);

    pressKey({ bubbles: true, key: "a" }, textarea);

    expect(tool.value).toBe(GestureTool.Select);
  });
});
