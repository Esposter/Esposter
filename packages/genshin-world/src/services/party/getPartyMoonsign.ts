import type { LunarReactionType } from "#src/models/combat/LunarReactionType";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitStatus } from "#src/models/kit/KitStatus";
import type { Party } from "#src/models/party/Party";
import type { PartyMoonsign } from "#src/models/party/PartyMoonsign";
import type { GroundPoint } from "genshin-engine";

import { MoonsignLevel } from "#src/models/combat/MoonsignLevel";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { ASCENDANT_GLEAM_STATUS_ID } from "#src/services/party/constants";
import { getAscendantGleamBonus } from "#src/services/party/getAscendantGleamBonus";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getMoonsignLevel } from "#src/services/party/getMoonsignLevel";

// The deployed team's Moonsign: its level, and each member's Benediction turning its reactions Lunar and adding the
// Base DMG Bonus it gives from its stats as they stand to each, the bonuses of two Benedictions on one reaction adding
// Up. While the level is Ascendant Gleam, the Ascendant Gleam a member lit gives every Lunar damage its reaction bonus
export const getPartyMoonsign = (
  characterIdCombatantMap: ReadonlyMap<number, Combatant>,
  effects: readonly KitEffect[],
  party: Party,
  position?: GroundPoint,
): PartyMoonsign => {
  const baseDamageBonusMap: Partial<Record<LunarReactionType, number>> = {};
  const lunarReactionTypes = new Set<LunarReactionType>();
  for (const characterId of getDeployedCharacterIds(party)) {
    const combatant = characterIdCombatantMap.get(characterId);
    const benediction = combatant?.kit.moonsignBenediction;
    if (!combatant || !benediction) continue;
    const baseDamageBonus =
      benediction.getBaseDamageBonus?.(
        getBuffedCombatant(combatant, effects, party, characterIdCombatantMap, position),
      ) ?? 0;
    for (const lunarReactionType of benediction.lunarReactionTypes) {
      lunarReactionTypes.add(lunarReactionType);
      baseDamageBonusMap[lunarReactionType] = (baseDamageBonusMap[lunarReactionType] ?? 0) + baseDamageBonus;
    }
  }

  const level = getMoonsignLevel(characterIdCombatantMap, party);
  const moonsign: PartyMoonsign = { baseDamageBonusMap, lunarReactionTypes: [...lunarReactionTypes], reactionBonus: 0 };
  if (level === undefined) return moonsign;
  const ascendantGleam =
    level === MoonsignLevel.AscendantGleam
      ? effects.find(
          (effect): effect is KitStatus => effect.kind === "status" && effect.id === ASCENDANT_GLEAM_STATUS_ID,
        )
      : undefined;
  const litCombatant = ascendantGleam && characterIdCombatantMap.get(ascendantGleam.characterId);
  return { ...moonsign, level, reactionBonus: litCombatant ? getAscendantGleamBonus(litCombatant) : 0 };
};
