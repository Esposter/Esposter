import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { NIGHTSOUL_BLESSING_STATUS_ID } from "#src/services/kit/constants";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { extendKitStatus } from "#src/services/kit/effects/extendKitStatus";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { takeOne } from "@esposter/shared";

const SCORCHING_BRILLIANCE_ID = "scorchingBrilliance";
const SCORCHING_BRILLIANCE_COOLDOWN_ID = "scorchingBrillianceCooldown";
const SCORCHING_BRILLIANCE_EXTENSION_COOLDOWN_ID = "scorchingBrillianceExtensionCooldown";

// Sunset Reignites the Dawn (A Thousand Blazing Suns) at its rank: the wielder's Elemental Skill or Burst gives it
// Scorching Brilliance for the rank's seconds, once every rank's cooldown, raising its CRIT DMG and ATK by the rank's
// Amounts. A normal or charged attack hit of its own that deals Elemental DMG while it holds extends it by the rank's
// Seconds, once every rank's extension cooldown, up to the rank's count of extensions. In the wielder's Nightsoul's
// Blessing its effects rise by the rank's share, and off the field its seconds stand still, as the mod of gcsim's
// Athousandblazingsuns.go is multiplied, and its status extended by each tick it is off the field
export const createSunsetReignitesTheDawnPassiveModule = (params: number[]): PassiveModule => {
  const criticalDamage = takeOne(params, 0);
  const attackPercent = takeOne(params, 1);
  const nightsoulShare = takeOne(params, 2);
  const seconds = takeOne(params, 3);
  const cooldownSeconds = takeOne(params, 4);
  const extensionSeconds = takeOne(params, 5);
  const extensionCooldownSeconds = takeOne(params, 6);
  const maximumExtensions = takeOne(params, 7);
  return {
    getPassiveBonuses: ({ characterId }, _healthShare, _deployedCombatants, effects) => {
      if (!checkIsKitStatusActive(effects, characterId, SCORCHING_BRILLIANCE_ID)) return [];
      const multiplier = checkHasKitStatus(effects, characterId, NIGHTSOUL_BLESSING_STATUS_ID) ? 1 + nightsoulShare : 1;
      return [
        { amount: criticalDamage * multiplier, attribute: Attribute.CriticalDamage },
        { amount: attackPercent * multiplier, attribute: Attribute.AttackPercent },
      ];
    },
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      if (event.kind === KitEventKind.SkillUsed || event.kind === KitEventKind.BurstUsed) {
        if (
          event.characterId === characterId &&
          startKitCooldown(kitEffectState, characterId, SCORCHING_BRILLIANCE_COOLDOWN_ID, cooldownSeconds)
        )
          addKitStatus(kitEffectState, characterId, { id: SCORCHING_BRILLIANCE_ID, secondsRemaining: seconds });
        return;
      }
      if (
        event.kind !== KitEventKind.EnemyHit ||
        event.striker.characterId !== characterId ||
        (event.attackTag !== AttackTag.NormalAttack && event.attackTag !== AttackTag.ChargedAttack) ||
        event.element === undefined ||
        !checkIsKitStatusActive(kitEffectState.effects, characterId, SCORCHING_BRILLIANCE_ID) ||
        !startKitCooldown(
          kitEffectState,
          characterId,
          SCORCHING_BRILLIANCE_EXTENSION_COOLDOWN_ID,
          extensionCooldownSeconds,
        )
      )
        return;
      extendKitStatus(kitEffectState, characterId, SCORCHING_BRILLIANCE_ID, {
        maximumSeconds: extensionSeconds * maximumExtensions,
        seconds: extensionSeconds,
      });
    },
    onStep: ({ kitEffectState, party }, { characterId }, stepSeconds) => {
      const { effects } = kitEffectState;
      const scorchingBrilliance = findKitStatus(effects, characterId, SCORCHING_BRILLIANCE_ID);
      if (
        scorchingBrilliance === undefined ||
        getActiveCharacterId(party) === characterId ||
        !checkHasKitStatus(effects, characterId, NIGHTSOUL_BLESSING_STATUS_ID)
      )
        return;
      scorchingBrilliance.secondsRemaining += stepSeconds;
    },
  };
};
