import type { WhiteboardTextEdit } from "@/models/whiteboard/WhiteboardTextEdit";

import { WHITEBOARD_PROCESS, WHITEBOARD_PROCESS_ID } from "@/services/whiteboard/constants.test";
import { getTextEditOperations } from "@/services/whiteboard/text/getTextEditOperations";
import { describe, expect, test } from "vitest";

describe(getTextEditOperations, () => {
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
