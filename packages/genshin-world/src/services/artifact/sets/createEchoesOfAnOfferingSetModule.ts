import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { takeOne } from "@esposter/shared";

const VALLEY_RITE_ID = "echoesOfAnOfferingValleyRite";
const VALLEY_RITE_ODDS_ID = "echoesOfAnOfferingValleyRiteOdds";
const VALLEY_RITE_COOLDOWN_ID = "echoesOfAnOfferingValleyRiteCooldown";

// Echoes of an Offering. Its four-piece bonus gives a Normal Attack that lands a chance (the first param) to raise its own DMG
// By the second param of its wearer's ATK. Each check that fails while the wearer is on the field raises the next chance by the
// Fourth param. The Valley Rite clears the third param's seconds after it lands, and a check is made at most once every fifth
// Param's seconds. The sixth param is unread
export const createEchoesOfAnOfferingSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const chance = takeOne(bonus.params, 0);
  const attackShare = takeOne(bonus.params, 1);
  const clearSeconds = takeOne(bonus.params, 2);
  const oddsIncrease = takeOne(bonus.params, 3);
  const cooldownSeconds = takeOne(bonus.params, 4);
  return {
    getStrikeAdditiveBaseDamageBonus: (strike, _enemy, _party, effects) =>
      strike.attackTag === AttackTag.NormalAttack &&
      checkIsKitStatusActive(effects, strike.combatant.characterId, VALLEY_RITE_ID)
        ? attackShare * strike.combatant.attributes.attack
        : 0,
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.NormalAttackLanded || !combatant.kit.normalAttacks.includes(event.action)) return;
      const { characterId } = combatant;
      const { kitEffectState, party, random } = context;
      if (checkIsKitStatusActive(kitEffectState.effects, characterId, VALLEY_RITE_COOLDOWN_ID)) return;
      addKitStatus(kitEffectState, characterId, { id: VALLEY_RITE_COOLDOWN_ID, secondsRemaining: cooldownSeconds });
      const failedChecks = findKitStatus(kitEffectState.effects, characterId, VALLEY_RITE_ODDS_ID)?.stacks ?? 0;
      if (random() < chance + oddsIncrease * failedChecks) {
        addKitStatus(kitEffectState, characterId, {
          id: VALLEY_RITE_ODDS_ID,
          secondsRemaining: Number.POSITIVE_INFINITY,
          stacks: 0,
        });
        addKitStatus(kitEffectState, characterId, { id: VALLEY_RITE_ID, secondsRemaining: clearSeconds });
        return;
      }
      // A failed check raises the odds only while the wearer stands on the field
      if (getActiveCharacterId(party) === characterId)
        addKitStatus(kitEffectState, characterId, {
          id: VALLEY_RITE_ODDS_ID,
          secondsRemaining: Number.POSITIVE_INFINITY,
          stacks: failedChecks + 1,
        });
    },
  };
};
