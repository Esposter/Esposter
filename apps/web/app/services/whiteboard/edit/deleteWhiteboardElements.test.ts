import type { TextElement } from "vue-block-editor-headless";

import {
  createWhiteboardEditState,
  WHITEBOARD_ARROW,
  WHITEBOARD_PROCESS,
  WHITEBOARD_PROCESS_ID,
} from "@/services/whiteboard/constants.test";
import { deleteWhiteboardElements } from "@/services/whiteboard/edit/deleteWhiteboardElements";
import { undoWhiteboardEdit } from "@/services/whiteboard/edit/undoWhiteboardEdit";
import { PositionedElementType } from "vue-block-editor-headless";
import { describe, expect, test } from "vitest";

describe(deleteWhiteboardElements, () => {
  test("deleting several elements is one undo step", () => {
    expect.hasAssertions();

    const text: TextElement = {
      id: crypto.randomUUID(),
      text: "",
      type: PositionedElementType.Text,
      width: 100,
      x: 200,
      y: 0,
    };
    const state = createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS, WHITEBOARD_ARROW, text] });
    const deletedState = deleteWhiteboardElements(state, [WHITEBOARD_PROCESS_ID, text.id]);

    expect(deletedState.document).toStrictEqual({ elements: [] });
    expect(deletedState.history.past).toHaveLength(1);
    expect(undoWhiteboardEdit(deletedState).document).toStrictEqual(state.document);
  });
});
