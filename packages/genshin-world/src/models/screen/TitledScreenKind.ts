import type { ScreenKind } from "#src/models/screen/ScreenKind";

// A screen with a title of its own: every screen but the world and the Paimon menu, which names none
export type TitledScreenKind = Exclude<ScreenKind, ScreenKind.PaimonMenu | ScreenKind.World>;
