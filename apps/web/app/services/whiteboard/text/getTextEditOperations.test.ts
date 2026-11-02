import type { WhiteboardTextEdit } from "@/models/whiteboard/WhiteboardTextEdit";

import { WHITEBOARD_PROCESS, WHITEBOARD_PROCESS_ID } from "@/services/whiteboard/constants.test";
import { getTextEditOperations } from "@/services/whiteboard/text/getTextEditOperations";
import { applyPatches } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getTextEditOperations, () => {
  test("a commit writes the draft as the text of its element", () => {
    expect.hasAssertions();

    const document = { elements: [WHITEBOARD_PROCESS] };
    const textEdit: WhiteboardTextEdit = {
      draft: "Review",
      elementId: WHITEBOARD_PROCESS_ID,
      isCommitPending: false,
      isComposing: false,
    };

    expect(applyPatches(document, getTextEditOperations(document, textEdit)).document).toStrictEqual({
      elements: [{ ...WHITEBOARD_PROCESS, text: "Review" }],
    });
  });

  test("a commit that leaves the text as it was writes no operations", () => {
    expect.hasAssertions();

    const document = { elements: [WHITEBOARD_PROCESS] };
    const textEdit: WhiteboardTextEdit = {
      draft: WHITEBOARD_PROCESS.text,
      elementId: WHITEBOARD_PROCESS_ID,
      isCommitPending: false,
      isComposing: false,
    };

    expect(getTextEditOperations(document, textEdit)).toStrictEqual([]);
  });
});
