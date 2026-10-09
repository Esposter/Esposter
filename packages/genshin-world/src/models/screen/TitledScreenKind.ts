import type { ScreenKind } from "#src/models/screen/ScreenKind";

// A screen with a title of its own: every screen but the world, the Paimon menu and a talk, which name none, and the
// Screens an NPC opens (the forge, the duel board), whose header is their own component's rather than a menu entry's
export type TitledScreenKind = Exclude<
  ScreenKind,
  ScreenKind.Dialogue | ScreenKind.Forge | ScreenKind.GcgDuel | ScreenKind.PaimonMenu | ScreenKind.World
>;
