import {
  createWhiteboardEditState,
  WHITEBOARD_ARROW,
  WHITEBOARD_ARROW_ID,
  WHITEBOARD_PROCESS,
  WHITEBOARD_PROCESS_ID,
} from "@/services/whiteboard/constants.test";
import { WHITEBOARD_DUPLICATE_OFFSET } from "@/services/whiteboard/edit/constants";
import { pasteWhiteboardElements } from "@/services/whiteboard/edit/pasteWhiteboardElements";
import { serializeClipboardElements } from "@/services/whiteboard/serializeClipboardElements";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

describe(pasteWhiteboardElements, () => {
  const ARROW_COPY_END = {
    hasArrowhead: true,
    point: {
      x: WHITEBOARD_ARROW.end.point.x + WHITEBOARD_DUPLICATE_OFFSET,
      y: WHITEBOARD_ARROW.end.point.y + WHITEBOARD_DUPLICATE_OFFSET,
    },
  };

  test("paste adds offset copies with fresh ids", () => {
    expect.hasAssertions();

    const state = createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS] });
    const pasted = pasteWhiteboardElements(state, serializeClipboardElements([WHITEBOARD_PROCESS]));
    assert.exists(pasted);
    const copyId = takeOne(pasted.copiedIds, 0);

    expect(copyId).not.toBe(WHITEBOARD_PROCESS_ID);
    expect(pasted.copiedIds).toStrictEqual([copyId]);
    expect(pasted.state.document).toStrictEqual({
      elements: [
        WHITEBOARD_PROCESS,
        { ...WHITEBOARD_PROCESS, id: copyId, x: WHITEBOARD_DUPLICATE_OFFSET, y: WHITEBOARD_DUPLICATE_OFFSET },
      ],
    });
  });

  test("a pasted arrow is bound to the pasted shapes", () => {
    expect.hasAssertions();

    const state = createWhiteboardEditState({ elements: [] });
    const pasted = pasteWhiteboardElements(state, serializeClipboardElements([WHITEBOARD_PROCESS, WHITEBOARD_ARROW]));
    assert.exists(pasted);
    const processCopyId = takeOne(pasted.copiedIds, 0);
    const arrowCopyId = takeOne(pasted.copiedIds, 1);

    expect(pasted.state.document).toStrictEqual({
      elements: [
        { ...WHITEBOARD_PROCESS, id: processCopyId, x: WHITEBOARD_DUPLICATE_OFFSET, y: WHITEBOARD_DUPLICATE_OFFSET },
        {
          ...WHITEBOARD_ARROW,
          end: ARROW_COPY_END,
          id: arrowCopyId,
          start: {
            binding: { connectionPointIndex: 2, elementId: processCopyId },
            hasArrowhead: false,
            point: { x: 50 + WHITEBOARD_DUPLICATE_OFFSET, y: 100 + WHITEBOARD_DUPLICATE_OFFSET },
          },
        },
      ],
    });
    expect(processCopyId).not.toBe(WHITEBOARD_PROCESS_ID);
  });

  test("an arrow pasted without its shapes has free ends", () => {
    expect.hasAssertions();

    const state = createWhiteboardEditState({ elements: [] });
    const pasted = pasteWhiteboardElements(state, serializeClipboardElements([WHITEBOARD_ARROW]));
    assert.exists(pasted);
    const arrowCopyId = takeOne(pasted.copiedIds, 0);

    expect(pasted.state.document).toStrictEqual({
      elements: [
        {
          ...WHITEBOARD_ARROW,
          end: ARROW_COPY_END,
          id: arrowCopyId,
          start: {
            hasArrowhead: false,
            point: { x: 50 + WHITEBOARD_DUPLICATE_OFFSET, y: 100 + WHITEBOARD_DUPLICATE_OFFSET },
          },
        },
      ],
    });
    expect(arrowCopyId).not.toBe(WHITEBOARD_ARROW_ID);
  });

  test("clipboard text without the marker is ignored", () => {
    expect.hasAssertions();

    const state = createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS] });

    expect(pasteWhiteboardElements(state, JSON.stringify({ elements: [WHITEBOARD_PROCESS] }))).toBeUndefined();
    expect(pasteWhiteboardElements(state, "")).toBeUndefined();
  });
});
