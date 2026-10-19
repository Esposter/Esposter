import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";
import { getKitMaxHealth } from "#src/services/kit/effects/getKitMaxHealth";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { takeOne } from "@esposter/shared";

const GRAND_HYMN_ID = "grandHymn";
const GRAND_HYMN_COOLDOWN_ID = "grandHymnCooldown";
const GRAND_HYMN_MAXIMUM_STACKS = 3;
const GRAND_HYMN_SOURCE = "sunkenSongOfTheSands";

// Key of Khaj-Nisut at its rank: its HP line is the table's. Each Elemental Skill hit adds a stack of the rank's share of the
// Wielder's Max HP as Elemental Mastery, up to three and once every cooldown, each stack running the rank's seconds. Whenever
// The stacks stand at three after a trigger, each other member of the deployed team gains the rank's share of the wielder's Max
// HP as Elemental Mastery for the rank's seconds, and a trigger at three restarts that buff
export const createSunkenSongOfTheSandsPassiveModule = (params: number[]): PassiveModule => {
  const stackShare = takeOne(params, 1);
  const stackSeconds = takeOne(params, 2);
  const cooldownSeconds = takeOne(params, 3);
  const teamShare = takeOne(params, 4);
  const teamSeconds = takeOne(params, 5);
  return {
    // The stack reads the Max HP the Wielder's own lines give, not the buffed one: getBuffedCombatant prices the passive's
    // Bonuses, so a buffed Max HP read here would call back into this function without end
    getPassiveBonuses: (combatant, _healthShare, _deployedCombatants, effects) => [
      {
        amount:
          countKitHolds(effects, combatant.characterId, GRAND_HYMN_ID) * stackShare * combatant.attributes.maxHealth,
        attribute: Attribute.ElementalMastery,
      },
    ],
    onKitEvent: (event, { characterIdCombatantMap, kitEffectState, party }, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        event.attackTag !== AttackTag.ElementalSkill ||
        !startKitCooldown(kitEffectState, combatant.characterId, GRAND_HYMN_COOLDOWN_ID, cooldownSeconds)
      )
        return;
      const { characterId } = combatant;
      addKitHold(kitEffectState, characterId, {
        id: GRAND_HYMN_ID,
        maximum: GRAND_HYMN_MAXIMUM_STACKS,
        replacesOldest: true,
        seconds: stackSeconds,
      });
      if (countKitHolds(kitEffectState.effects, characterId, GRAND_HYMN_ID) < GRAND_HYMN_MAXIMUM_STACKS) return;
      const amount = teamShare * getKitMaxHealth(combatant, kitEffectState.effects, party, characterIdCombatantMap);
      for (const memberId of getDeployedCharacterIds(party))
        if (memberId !== characterId)
          buffKitMember(kitEffectState, memberId, {
            amount,
            attribute: Attribute.ElementalMastery,
            secondsRemaining: teamSeconds,
            source: GRAND_HYMN_SOURCE,
          });
    },
  };
};
