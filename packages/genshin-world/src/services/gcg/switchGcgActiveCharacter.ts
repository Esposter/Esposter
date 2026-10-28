import { applyGcgDamage } from "#src/services/gcg/applyGcgDamage";
import { createGcgActiveCharacterSwitch } from "#src/services/gcg/createGcgActiveCharacterSwitch";

// The switch every combat, card and effect switch takes, the damage its hooks deal dealt by applyGcgDamage
export const switchGcgActiveCharacter: ReturnType<typeof createGcgActiveCharacterSwitch> =
  createGcgActiveCharacterSwitch((duel, sourceSideIndex, damage, rule) => {
    applyGcgDamage(duel, sourceSideIndex, damage, rule);
  });
