import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { gainKitResource } from "#src/services/kit/effects/gainKitResource";
import { spendKitResource } from "#src/services/kit/effects/spendKitResource";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { takeOne } from "@esposter/shared";

const WINDS_CYCLE_ID = "windsCycle";
const WINDS_OF_DEFIANCE_ID = "windsOfDefiance";
const WINDS_OF_PLENTY_COOLDOWN_ID = "windsOfPlentyCooldown";
const WINDS_OF_DEVOTION_SOURCE = "windsOfDevotion";
// The three effects, in the order a use of the skill or burst gives them
const EFFECT_COUNT = 3;

// Dance of Wings Unbound (Beyond the Chrysalis) at its rank: each Elemental Skill or Burst its wielder uses gives it
// One of three Effects in turn, the Winds of Devotion's CRIT DMG, the Winds of Defiance's Stellar Swirl DMG and the
// Winds of Plenty's Energy, Which holds off the next Energy for the rank's cooldown. Its effects end and its sequence
// Resets as the wielder leaves the field
export const createDanceOfWingsUnboundPassiveModule = (params: number[]): PassiveModule => {
  const criticalDamage = takeOne(params, 0);
  const stellarSwirlDamage = takeOne(params, 1);
  const energy = takeOne(params, 2);
  const seconds = takeOne(params, 3);
  const energyCooldownSeconds = takeOne(params, 4);
  return {
    getPartyReactionBonus: ({ characterId }, { combatant, reactionType }, { kitEffectState }) =>
      combatant.characterId === characterId &&
      reactionType === StellarReactionType.StellarSwirl &&
      checkIsKitStatusActive(kitEffectState.effects, characterId, WINDS_OF_DEFIANCE_ID)
        ? { damageBonus: stellarSwirlDamage }
        : {},
    onKitEvent: (event, context, combatant) => {
      const { characterId } = combatant;
      const { kitEffectState } = context;
      if (event.kind === KitEventKind.CharacterSwapped) {
        if (event.previousCharacterId === characterId) spendKitResource(kitEffectState, characterId, WINDS_CYCLE_ID);
        return;
      }
      if (
        (event.kind !== KitEventKind.SkillUsed && event.kind !== KitEventKind.BurstUsed) ||
        event.characterId !== characterId
      )
        return;
      const uses = gainKitResource(kitEffectState, characterId, WINDS_CYCLE_ID, 1, Number.POSITIVE_INFINITY);
      const effectIndex = (uses - 1) % EFFECT_COUNT;
      if (effectIndex === 0)
        buffKitMember(kitEffectState, characterId, {
          amount: criticalDamage,
          attribute: Attribute.CriticalDamage,
          isEndedOnSwap: true,
          secondsRemaining: seconds,
          source: WINDS_OF_DEVOTION_SOURCE,
        });
      else if (effectIndex === 1)
        addKitStatus(kitEffectState, characterId, {
          id: WINDS_OF_DEFIANCE_ID,
          isEndedOnSwap: true,
          secondsRemaining: seconds,
        });
      else if (startKitCooldown(kitEffectState, characterId, WINDS_OF_PLENTY_COOLDOWN_ID, energyCooldownSeconds))
        gainPartyMemberEnergy(context.party, combatant, energy);
    },
  };
};
