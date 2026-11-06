import { createWhiteboardEditState, WHITEBOARD_ARROW, WHITEBOARD_PROCESS } from "@/services/whiteboard/constants.test";
import { applyWhiteboardEdit } from "@/services/whiteboard/edit/applyWhiteboardEdit";
import { describe, expect, test } from "vitest";
import { updatePositionedElementText } from "vue-block-editor-headless";

describe(applyWhiteboardEdit, () => {
  test("an edit with no operations leaves the state as it was", () => {
    expect.hasAssertions();

    const state = createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS, WHITEBOARD_ARROW] });

    expect(applyWhiteboardEdit(state, [])).toBe(state);
  });

  test("an edit is one history entry, however many operations it holds", () => {
    expect.hasAssertions();

    const state = createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS, WHITEBOARD_ARROW] });
    const editedState = applyWhiteboardEdit(state, [
      ...updatePositionedElementText(state.document, 0, "Review"),
      ...updatePositionedElementText(state.document, 1, "Yes"),
    ]);

    expect(editedState.history.past).toHaveLength(1);
    expect(editedState.document).toStrictEqual({
      elements: [
        { ...WHITEBOARD_PROCESS, text: "Review" },
        { ...WHITEBOARD_ARROW, label: "Yes" },
      ],
    });
  });
});
