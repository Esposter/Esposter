import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { takeOne } from "@esposter/shared";

const MOURNFUL_TRIBUTE_ID = "mournfulTribute";
const REQUIEM_OF_RUIN_ID = "requiemOfRuin";
const REQUIEM_OF_RUIN_ENERGY_COOLDOWN_ID = "requiemOfRuinEnergyCooldown";

// Mournful Tribute (Bloodsoaked Ruins) at its rank: for the rank's seconds after its wielder's Elemental Burst, the
// Lunar-Charged DMG the wielder deals rises by the rank's amount, its direct and reaction hits alike. A Lunar-Charged
// The wielder triggers while on the field gives it Requiem of Ruin, the rank's CRIT DMG for the rank's seconds, and the
// Rank's Energy once every rank's cooldown, as gcsim's bloodsoakedruins.go reads its OnLunarCharged by the wielder on
// The field
export const createMournfulTributePassiveModule = (params: number[]): PassiveModule => {
  const lunarChargedSeconds = takeOne(params, 0);
  const damageBonus = takeOne(params, 1);
  const requiemOfRuinSeconds = takeOne(params, 2);
  const criticalDamage = takeOne(params, 3);
  const energy = takeOne(params, 4);
  const energyCooldownSeconds = takeOne(params, 5);
  return {
    getPartyReactionBonus: (member, { combatant, reactionType }, { kitEffectState }) =>
      combatant.characterId === member.characterId &&
      reactionType === LunarReactionType.LunarCharged &&
      checkIsKitStatusActive(kitEffectState.effects, member.characterId, MOURNFUL_TRIBUTE_ID)
        ? { damageBonus }
        : {},
    getPassiveBonuses: ({ characterId }, _healthShare, _deployedCombatants, effects) =>
      checkIsKitStatusActive(effects, characterId, REQUIEM_OF_RUIN_ID)
        ? [{ amount: criticalDamage, attribute: Attribute.CriticalDamage }]
        : [],
    onKitEvent: (event, { kitEffectState, party }, combatant) => {
      const { characterId } = combatant;
      if (event.kind === KitEventKind.BurstUsed) {
        if (event.characterId === characterId)
          addKitStatus(kitEffectState, characterId, { id: MOURNFUL_TRIBUTE_ID, secondsRemaining: lunarChargedSeconds });
        return;
      }
      if (
        event.kind !== KitEventKind.ReactionTriggered ||
        event.striker.characterId !== characterId ||
        getActiveCharacterId(party) !== characterId ||
        !event.reactions.some(({ reactionType }) => reactionType === LunarReactionType.LunarCharged)
      )
        return;
      addKitStatus(kitEffectState, characterId, { id: REQUIEM_OF_RUIN_ID, secondsRemaining: requiemOfRuinSeconds });
      if (startKitCooldown(kitEffectState, characterId, REQUIEM_OF_RUIN_ENERGY_COOLDOWN_ID, energyCooldownSeconds))
        gainPartyMemberEnergy(party, combatant, energy);
    },
  };
};
