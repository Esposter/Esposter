import { createWhiteboardEditState, WHITEBOARD_PROCESS } from "#src/services/whiteboard/constants.test";
import { undoWhiteboardEdit } from "#src/services/whiteboard/edit/undoWhiteboardEdit";
import { describe, expect, test } from "vitest";

describe(undoWhiteboardEdit, () => {
  test("an undo with nothing to undo leaves the state as it was", () => {
    expect.hasAssertions();

    const state = createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS] });

    expect(undoWhiteboardEdit(state)).toBe(state);
  });
});
