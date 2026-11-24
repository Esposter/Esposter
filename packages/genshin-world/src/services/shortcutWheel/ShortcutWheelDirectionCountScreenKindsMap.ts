import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";

import { ScreenKind } from "#src/models/screen/ScreenKind";
import { ShortcutWheelDirectionCount } from "#src/models/shortcutWheel/ShortcutWheelDirectionCount";

// The wheel's default entries by its direction count, clockwise from the top, each the screen it opens, as the wiki
// Gives them. The eight-direction wheel's eighth default, the Battle Pass, draws no entry in the world, so its
// Direction is left empty rather than given another screen, and the wheel draws no slot for an unassigned direction
export const ShortcutWheelDirectionCountScreenKindsMap: Readonly<
  Record<ShortcutWheelDirectionCount, readonly TitledScreenKind[]>
> = {
  [ShortcutWheelDirectionCount.Eight]: [
    ScreenKind.Wish,
    ScreenKind.AdventurerHandbook,
    ScreenKind.Inventory,
    ScreenKind.Character,
    ScreenKind.Map,
    ScreenKind.Quests,
    ScreenKind.Events,
  ],
  [ShortcutWheelDirectionCount.Four]: [ScreenKind.Wish, ScreenKind.Inventory, ScreenKind.Map, ScreenKind.Events],
};
