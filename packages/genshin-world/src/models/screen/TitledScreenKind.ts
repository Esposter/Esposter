import type { ScreenKind } from "#src/models/screen/ScreenKind";

// A screen with a title of its own: every screen but the world, the Paimon menu and a talk, which name none
export type TitledScreenKind = Exclude<
  ScreenKind,
  ScreenKind.Dialogue | ScreenKind.GcgDuel | ScreenKind.PaimonMenu | ScreenKind.World
>;
