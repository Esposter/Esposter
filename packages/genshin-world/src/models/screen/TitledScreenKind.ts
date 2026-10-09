import type { NpcScreenKind } from "#src/models/screen/NpcScreenKind";
import type { ScreenKind } from "#src/models/screen/ScreenKind";

// A screen with a title of its own: every screen but the world, the Paimon menu, a talk and the screens an NPC opens
export type TitledScreenKind = Exclude<
  ScreenKind,
  NpcScreenKind | ScreenKind.Dialogue | ScreenKind.PaimonMenu | ScreenKind.World
>;
