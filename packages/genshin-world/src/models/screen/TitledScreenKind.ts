import type { NpcScreenKind } from "#src/models/screen/NpcScreenKind";
import type { ScreenKind } from "#src/models/screen/ScreenKind";

// A screen with a title of its own in the Paimon menu: every screen but the world, the Paimon menu, a talk, the game over
// Which the world opens and no menu lists, and the screens an NPC opens
export type TitledScreenKind = Exclude<
  ScreenKind,
  NpcScreenKind | ScreenKind.Dialogue | ScreenKind.GameOver | ScreenKind.PaimonMenu | ScreenKind.World
>;
