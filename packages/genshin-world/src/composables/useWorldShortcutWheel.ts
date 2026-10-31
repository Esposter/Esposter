import type { ScreenKind } from "#src/models/screen/ScreenKind";
import type { ShortcutWheelStep } from "#src/models/shortcutWheel/ShortcutWheelStep";
import type { Ref } from "vue";

import { ShortcutWheelDirectionCount } from "#src/models/shortcutWheel/ShortcutWheelDirectionCount";
import { getShortcutWheelStep } from "#src/services/shortcutWheel/getShortcutWheelStep";
import { ref } from "vue";

export const useWorldShortcutWheel = ({ screenKind }: { screenKind: Ref<ScreenKind> }) => {
  // The shortcut wheel is open while its key is held in the world: the move points at an entry, and letting the key go
  // Opens that entry's screen
  const shortcutWheelDirectionCount = ShortcutWheelDirectionCount.Eight;
  const isShortcutWheelOpen = ref(false);
  const shortcutWheelPickedIndex = ref<number>();
  let shortcutWheelStep: ShortcutWheelStep = {
    isOpen: false,
    move: { x: 0, y: 0 },
    openedScreenKind: undefined,
    pickedIndex: undefined,
  };
  const stepShortcutWheel = (isHeld: boolean, x: number, y: number): void => {
    shortcutWheelStep = getShortcutWheelStep(shortcutWheelStep, isHeld, { x, y }, shortcutWheelDirectionCount);
    isShortcutWheelOpen.value = shortcutWheelStep.isOpen;
    shortcutWheelPickedIndex.value = shortcutWheelStep.pickedIndex;
    if (shortcutWheelStep.openedScreenKind !== undefined) screenKind.value = shortcutWheelStep.openedScreenKind;
  };
  // A screen that takes the world closes the wheel without opening the entry its key was let go on, so the wheel does not
  // Open on the world's first frame after the screen
  const closeShortcutWheel = (): void => {
    if (!shortcutWheelStep.isOpen) return;
    shortcutWheelStep = {
      isOpen: false,
      move: shortcutWheelStep.move,
      openedScreenKind: undefined,
      pickedIndex: undefined,
    };
    isShortcutWheelOpen.value = false;
    shortcutWheelPickedIndex.value = undefined;
  };

  return {
    closeShortcutWheel,
    isShortcutWheelOpen,
    shortcutWheelDirectionCount,
    shortcutWheelPickedIndex,
    stepShortcutWheel,
  };
};
