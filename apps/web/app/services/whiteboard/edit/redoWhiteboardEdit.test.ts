import { createWhiteboardEditState, WHITEBOARD_PROCESS } from "@/services/whiteboard/constants.test";
import { applyWhiteboardEdit } from "@/services/whiteboard/edit/applyWhiteboardEdit";
import { redoWhiteboardEdit } from "@/services/whiteboard/edit/redoWhiteboardEdit";
import { undoWhiteboardEdit } from "@/services/whiteboard/edit/undoWhiteboardEdit";
import { describe, expect, test } from "vitest";
import { updatePositionedElementText } from "vue-block-editor-headless";

describe(redoWhiteboardEdit, () => {
  test("a redo restores the undone edit", () => {
    expect.hasAssertions();

    const state = createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS] });
    const editedState = applyWhiteboardEdit(state, updatePositionedElementText(state.document, 0, " "));
    const redoneState = redoWhiteboardEdit(undoWhiteboardEdit(editedState));

    expect(redoneState).toStrictEqual(editedState);
  });

  test("a redo with nothing to redo leaves the state as it was", () => {
    expect.hasAssertions();

    const state = createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS] });

    expect(redoWhiteboardEdit(state)).toBe(state);
  });

  test("a new edit after an undo clears the redo stack", () => {
    expect.hasAssertions();

    const state = createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS] });
    const editedState = applyWhiteboardEdit(state, updatePositionedElementText(state.document, 0, " "));
    const undoneState = undoWhiteboardEdit(editedState);
    const newState = applyWhiteboardEdit(undoneState, updatePositionedElementText(undoneState.document, 0, " "));

    expect(newState.history.future).toHaveLength(0);
  });
});
