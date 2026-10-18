import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { Party } from "#src/models/party/Party";
import type { GroundPoint } from "genshin-engine";

import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// The Base DMG Bonus the deployed team's Stellar Jubilees add to its Stellar damage, each from its holder's stats as the
// Team's buffs leave them, two adding up, as each Jubilee adds its own in gcsim (MIT) odette/stellar.go and
// Traveler/common/cryo/stellar.go
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/odette/stellar.go
export const getPartyStellarBaseDamageBonus = (
  characterIdCombatantMap: ReadonlyMap<number, Combatant>,
  effects: readonly KitEffect[],
  party: Party,
  position?: GroundPoint,
): number => {
  let baseDamageBonus = 0;
  for (const characterId of getDeployedCharacterIds(party)) {
    const combatant = characterIdCombatantMap.get(characterId);
    const getBaseDamageBonus = combatant?.kit.stellarJubilee?.getBaseDamageBonus;
    if (!combatant || !getBaseDamageBonus) continue;
    baseDamageBonus += getBaseDamageBonus(
      getBuffedCombatant(combatant, effects, party, characterIdCombatantMap, position),
    );
  }
  return baseDamageBonus;
};
