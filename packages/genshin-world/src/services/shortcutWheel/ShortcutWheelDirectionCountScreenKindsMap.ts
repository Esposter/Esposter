import type { ShortcutWheelDirectionCount } from "#src/models/shortcutWheel/ShortcutWheelDirectionCount";

import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";

import { ScreenKind } from "#src/models/screen/ScreenKind";
import { ShortcutWheelDirectionCount as DirectionCount } from "#src/models/shortcutWheel/ShortcutWheelDirectionCount";

// The wheel's default entries by its direction count, clockwise from the top, each the screen it opens, as the wiki gives
// Them
export const ShortcutWheelDirectionCountScreenKindsMap: Readonly<
  Record<ShortcutWheelDirectionCount, readonly TitledScreenKind[]>
> = {
  [DirectionCount.Eight]: [
    ScreenKind.Wish,
    ScreenKind.AdventurerHandbook,
    ScreenKind.Inventory,
    ScreenKind.Character,
    ScreenKind.Map,
    ScreenKind.Quests,
    ScreenKind.Events,
    ScreenKind.BattlePass,
  ],
  [DirectionCount.Four]: [ScreenKind.Wish, ScreenKind.Inventory, ScreenKind.Map, ScreenKind.Events],
};
