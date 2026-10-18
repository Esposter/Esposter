import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { PassiveModule } from "#src/models/kit/PassiveModule";
import type { Party } from "#src/models/party/Party";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { takeOne } from "@esposter/shared";

const MIRROR_OF_NIGHT_ID = "mirrorOfNight";
const MIRROR_OF_NIGHT_COOLDOWN_ID = "mirrorOfNightCooldown";

// Offering Unto Wind and Sun (Starcaller's Watch) at its rank: a shield its wielder casts while on the field gives it
// Mirror of Night for the rank's seconds, once every cooldown, and while it holds the member on the field deals the
// Rank's DMG Bonus. gcsim's starcallerswatch.go reads its OnShielded by the shield's owner with the wielder on the
// Field, and gives each character an attack mod that reads only while that character is the active one
export const createOfferingUntoWindAndSunPassiveModule = (params: number[]): PassiveModule => {
  const damageBonus = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  const cooldownSeconds = takeOne(params, 2);
  // The DMG Bonus a strike takes from the wielder's Mirror of Night, if the striker is the member on the field
  const getMirrorOfNightDamageBonus = (
    wielderCharacterId: number,
    strike: KitStrike,
    party: Party,
    effects: readonly KitEffect[],
  ): number =>
    strike.combatant.characterId === getActiveCharacterId(party) &&
    checkIsKitStatusActive(effects, wielderCharacterId, MIRROR_OF_NIGHT_ID)
      ? damageBonus
      : 0;
  return {
    getPartyStrikeBonus: (member, strike, _enemy, party, effects) => ({
      damageBonus: getMirrorOfNightDamageBonus(member.characterId, strike, party, effects),
    }),
    getStrikeDamageBonus: (strike, _enemy, party, effects) =>
      getMirrorOfNightDamageBonus(strike.combatant.characterId, strike, party, effects),
    onKitEvent: (event, { kitEffectState, party }, combatant) => {
      const { characterId } = combatant;
      if (
        event.kind !== KitEventKind.ShieldCast ||
        event.shield.characterId !== characterId ||
        getActiveCharacterId(party) !== characterId ||
        !startKitCooldown(kitEffectState, characterId, MIRROR_OF_NIGHT_COOLDOWN_ID, cooldownSeconds)
      )
        return;
      addKitStatus(kitEffectState, characterId, { id: MIRROR_OF_NIGHT_ID, secondsRemaining: seconds });
    },
  };
};
