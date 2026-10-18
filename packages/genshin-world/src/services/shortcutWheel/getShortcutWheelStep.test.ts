import { ScreenKind } from "#src/models/screen/ScreenKind";
import { ShortcutWheelDirectionCount } from "#src/models/shortcutWheel/ShortcutWheelDirectionCount";
import type { ShortcutWheelStep } from "#src/models/shortcutWheel/ShortcutWheelStep";
import { getShortcutWheelStep } from "#src/services/shortcutWheel/getShortcutWheelStep";
import { describe, expect, test } from "vitest";

describe(getShortcutWheelStep, () => {
  const CLOSED: ShortcutWheelStep = {
    isOpen: false,
    move: { x: 0, y: 0 },
    openedScreenKind: undefined,
    pickedIndex: undefined,
  };

  // A move to the right, held while Tab is, opens the wheel with the entry at three o'clock picked
  test("holding Tab opens the wheel", () => {
    expect.hasAssertions();

    expect(getShortcutWheelStep(CLOSED, true, { x: 1, y: 0 }, ShortcutWheelDirectionCount.Eight)).toStrictEqual({
      isOpen: true,
      move: { x: 1, y: 0 },
      openedScreenKind: undefined,
      pickedIndex: 2,
    });
  });

  // Letting Tab go with the move still at three o'clock closes the wheel and opens that entry's Inventory
  test("releasing on an entry opens its screen", () => {
    expect.hasAssertions();

    const open = getShortcutWheelStep(CLOSED, true, { x: 1, y: 0 }, ShortcutWheelDirectionCount.Eight);

    expect(getShortcutWheelStep(open, false, { x: 0, y: 0 }, ShortcutWheelDirectionCount.Eight)).toStrictEqual({
      isOpen: false,
      move: { x: 1, y: 0 },
      openedScreenKind: ScreenKind.Inventory,
      pickedIndex: undefined,
    });
  });

  // Letting Tab go with the move at the centre closes the wheel without opening any screen
  test("releasing at the centre opens nothing", () => {
    expect.hasAssertions();

    const open = getShortcutWheelStep(CLOSED, true, { x: 0, y: 0 }, ShortcutWheelDirectionCount.Eight);

    expect(getShortcutWheelStep(open, false, { x: 0, y: 0 }, ShortcutWheelDirectionCount.Eight)).toStrictEqual({
      isOpen: false,
      move: { x: 0, y: 0 },
      openedScreenKind: undefined,
      pickedIndex: undefined,
    });
  });
});
