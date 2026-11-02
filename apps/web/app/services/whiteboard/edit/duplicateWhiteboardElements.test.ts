import {
  WHITEBOARD_ARROW,
  WHITEBOARD_ARROW_ID,
  WHITEBOARD_PROCESS,
  WHITEBOARD_PROCESS_ID,
  createWhiteboardEditState,
} from "@/services/whiteboard/constants.test";
import { WHITEBOARD_DUPLICATE_OFFSET } from "@/services/whiteboard/edit/constants";
import { duplicateWhiteboardElements } from "@/services/whiteboard/edit/duplicateWhiteboardElements";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(duplicateWhiteboardElements, () => {
  const ARROW_COPY_END = {
    hasArrowhead: true,
    point: {
      x: WHITEBOARD_ARROW.end.point.x + WHITEBOARD_DUPLICATE_OFFSET,
      y: WHITEBOARD_ARROW.end.point.y + WHITEBOARD_DUPLICATE_OFFSET,
    },
  };

  test("duplicating a shape with its arrow copies both on top, offset, with the arrow bound to the copy", () => {
    expect.hasAssertions();

    const state = createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS, WHITEBOARD_ARROW] });
    const { copiedIds, state: duplicatedState } = duplicateWhiteboardElements(state, [
      WHITEBOARD_PROCESS_ID,
      WHITEBOARD_ARROW_ID,
    ]);
    const processCopyId = takeOne(copiedIds, 0);
    const arrowCopyId = takeOne(copiedIds, 1);

    expect(duplicatedState.document).toStrictEqual({
      elements: [
        WHITEBOARD_PROCESS,
        WHITEBOARD_ARROW,
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
  });

  test("an arrow whose shape is not duplicated is copied free at its ends", () => {
    expect.hasAssertions();

    const state = createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS, WHITEBOARD_ARROW] });
    const { copiedIds, state: duplicatedState } = duplicateWhiteboardElements(state, [WHITEBOARD_ARROW_ID]);
    const arrowCopyId = takeOne(copiedIds, 0);

    expect(duplicatedState.document.elements.at(-1)).toStrictEqual({
      ...WHITEBOARD_ARROW,
      end: ARROW_COPY_END,
      id: arrowCopyId,
      start: {
        hasArrowhead: false,
        point: { x: 50 + WHITEBOARD_DUPLICATE_OFFSET, y: 100 + WHITEBOARD_DUPLICATE_OFFSET },
      },
    });
  });
});
