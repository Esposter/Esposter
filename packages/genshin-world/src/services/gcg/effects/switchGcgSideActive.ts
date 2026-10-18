import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { takeOne } from "@esposter/shared";

// Switches a side's active character to the one at characterIndex, flagged as switched in this round, so her next Normal
// Attack is a Plunging Attack. A combat switch and an effect's switch both take this path. A defeat's replacement does not,
// Since it replaces the fallen and does not switch. Whether an effect's switch counts is provisional, as the rules design
// Records
export const switchGcgSideActive = (side: GcgSideState, characterIndex: number): void => {
  side.activeIndex = characterIndex;
  takeOne(side.characters, characterIndex).isSwitchedIn = true;
};
