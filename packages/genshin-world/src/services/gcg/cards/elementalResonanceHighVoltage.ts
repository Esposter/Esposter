import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { takeOne } from "@esposter/shared";

export const ELEMENTAL_RESONANCE_HIGH_VOLTAGE_ID = 331_402;

// Elemental Resonance: High Voltage, an event: the active character and the next character without maximum Energy each gain
// 1 Energy (the wiki's Elemental Resonance: High Voltage)
export const elementalResonanceHighVoltage: GcgCardModule = {
  play: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    const characterCount = side.characters.length;
    const nextIndex = Array.from(
      { length: characterCount - 1 },
      (_, offset) => (side.activeIndex + offset + 1) % characterCount,
    ).find((index) => {
      const character = takeOne(side.characters, index);
      return character.hp > 0 && character.energy < character.character.maxEnergy;
    });
    for (const index of [side.activeIndex, nextIndex]) {
      if (index === undefined) continue;
      const character = takeOne(side.characters, index);
      character.energy = Math.min(character.character.maxEnergy, character.energy + 1);
    }
  },
};
