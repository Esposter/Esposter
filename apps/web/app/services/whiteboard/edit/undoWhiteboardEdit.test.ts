import {
  createWhiteboardEditState,
  WHITEBOARD_ARROW,
  WHITEBOARD_PROCESS,
  WHITEBOARD_PROCESS_ID,
} from "@/services/whiteboard/constants.test";
import { applyWhiteboardEdit } from "@/services/whiteboard/edit/applyWhiteboardEdit";
import { undoWhiteboardEdit } from "@/services/whiteboard/edit/undoWhiteboardEdit";
import { getMoveOperations } from "@/services/whiteboard/gesture/getMoveOperations";
import { describe, expect, test } from "vitest";

describe(undoWhiteboardEdit, () => {
  test("undo reverts a move and its reroute together", () => {
    expect.hasAssertions();

    const state = createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS, WHITEBOARD_ARROW] });
    const movedState = applyWhiteboardEdit(
      state,
      getMoveOperations(state.document, [WHITEBOARD_PROCESS_ID], { x: 10, y: 0 }, false),
    );

    expect(movedState.document.elements[1]).toStrictEqual({
      ...WHITEBOARD_ARROW,
      start: { ...WHITEBOARD_ARROW.start, point: { x: 60, y: 100 } },
    });
    expect(undoWhiteboardEdit(movedState).document).toStrictEqual(state.document);
  });

  test("an undo with nothing to undo leaves the state as it was", () => {
    expect.hasAssertions();

    const state = createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS] });

    expect(undoWhiteboardEdit(state)).toBe(state);
  });
});
