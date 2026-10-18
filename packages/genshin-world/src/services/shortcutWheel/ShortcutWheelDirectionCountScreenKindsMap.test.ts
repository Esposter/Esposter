import { ScreenKind } from "#src/models/screen/ScreenKind";
import { ShortcutWheelDirectionCount } from "#src/models/shortcutWheel/ShortcutWheelDirectionCount";
import { ShortcutWheelDirectionCountScreenKindsMap } from "#src/services/shortcutWheel/ShortcutWheelDirectionCountScreenKindsMap";
import { describe, expect, test } from "vitest";

describe("shortcutWheelDirectionCountScreenKindsMap", () => {
  test("the eight-direction wheel holds its defaults in order", () => {
    expect.hasAssertions();
    expect(ShortcutWheelDirectionCountScreenKindsMap[ShortcutWheelDirectionCount.Eight]).toStrictEqual([
      ScreenKind.Wish,
      ScreenKind.AdventurerHandbook,
      ScreenKind.Inventory,
      ScreenKind.Character,
      ScreenKind.Map,
      ScreenKind.Quests,
      ScreenKind.Events,
      ScreenKind.BattlePass,
    ]);
  });

  test("the four-direction wheel holds its defaults in order", () => {
    expect.hasAssertions();
    expect(ShortcutWheelDirectionCountScreenKindsMap[ShortcutWheelDirectionCount.Four]).toStrictEqual([
      ScreenKind.Wish,
      ScreenKind.Inventory,
      ScreenKind.Map,
      ScreenKind.Events,
    ]);
  });
});
