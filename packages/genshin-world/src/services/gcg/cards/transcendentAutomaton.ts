import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { createGcgTalentCard } from "#src/services/gcg/effects/createGcgTalentCard";
import { findGcgAdjacentCharacterIndex } from "#src/services/gcg/findGcgAdjacentCharacterIndex";
import { takeOne } from "@esposter/shared";

const MAGUU_KENKI_ID = 2501;
const BLUSTERING_BLADE_ID = 25_012;
const FROSTY_ASSAULT_ID = 25_013;

// Transcendent Automaton: Maguu Kenki, while active, equips it, and Blustering Blade is used at once. Her Blustering Blade
// Switches to the next standing character, and her Frosty Assault to the previous one
export const transcendentAutomaton: GcgCardModule = {
  ...createGcgTalentCard(MAGUU_KENKI_ID, BLUSTERING_BLADE_ID),
  onSkillUsed: ({ duel, sideIndex }, skill) => {
    const side = takeOne(duel.sides, sideIndex);
    const step = skill.id === BLUSTERING_BLADE_ID ? 1 : skill.id === FROSTY_ASSAULT_ID ? -1 : undefined;
    if (step === undefined) return;
    const nextIndex = findGcgAdjacentCharacterIndex(side, side.activeIndex, step);
    if (nextIndex !== undefined) side.activeIndex = nextIndex;
  },
};
