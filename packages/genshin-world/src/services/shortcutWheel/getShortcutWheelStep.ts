import type { ShortcutWheelDirectionCount } from "#src/models/shortcutWheel/ShortcutWheelDirectionCount";
import type { ShortcutWheelStep } from "#src/models/shortcutWheel/ShortcutWheelStep";

import { getShortcutWheelDirectionIndex } from "#src/services/shortcutWheel/getShortcutWheelDirectionIndex";
import { ShortcutWheelDirectionCountScreenKindsMap } from "#src/services/shortcutWheel/ShortcutWheelDirectionCountScreenKindsMap";

// The wheel for this frame: open while its key is held, its pick the entry the move points at. The frame the key lets go,
// The wheel closes and opens the entry its last held move pointed at, if that move pointed at one
export const getShortcutWheelStep = (
  previous: ShortcutWheelStep,
  isHeld: boolean,
  move: ShortcutWheelStep["move"],
  directionCount: ShortcutWheelDirectionCount,
): ShortcutWheelStep => {
  if (isHeld)
    return {
      isOpen: true,
      move,
      openedScreenKind: undefined,
      pickedIndex: getShortcutWheelDirectionIndex(move.x, move.y, directionCount),
    };
  const openedIndex = previous.isOpen
    ? getShortcutWheelDirectionIndex(previous.move.x, previous.move.y, directionCount)
    : undefined;
  return {
    isOpen: false,
    move: previous.move,
    openedScreenKind:
      openedIndex === undefined ? undefined : ShortcutWheelDirectionCountScreenKindsMap[directionCount][openedIndex],
    pickedIndex: undefined,
  };
};
