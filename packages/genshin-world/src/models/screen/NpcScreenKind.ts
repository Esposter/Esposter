import type { NPC_SCREEN_KINDS } from "#src/services/screen/constants";

// A screen an NPC or a world object opens, which no menu titles
export type NpcScreenKind = (typeof NPC_SCREEN_KINDS)[number];
