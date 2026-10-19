import type { ScreenKind } from "#src/models/screen/ScreenKind";
import type { UNTITLED_SCREEN_KINDS } from "#src/services/screen/constants";

// A screen with a title of its own in the Paimon menu: every screen but the untitled kinds, which are the world, the
// Paimon menu, a talk, the game over and the screens an NPC opens
export type TitledScreenKind = Exclude<ScreenKind, (typeof UNTITLED_SCREEN_KINDS)[number]>;
