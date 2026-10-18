import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStatus } from "#src/models/kit/KitStatus";
import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsKitHold } from "#src/services/kit/effects/checkIsKitHold";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { takeOne } from "@esposter/shared";

const GRAND_HYMN_ID = "grandHymn";
const GRAND_HYMN_COOLDOWN_ID = "grandHymnCooldown";
const GRAND_HYMN_MAXIMUM_STACKS = 3;
const GRAND_HYMN_SOURCE = "sunkenSongOfTheSands";

// The Grand Hymn stack that runs out soonest is the one a trigger at the maximum restarts
const refreshSoonestGrandHymnHold = (kitEffectState: KitEffectState, characterId: number, seconds: number): void => {
  const holds = kitEffectState.effects.filter((effect): effect is KitStatus =>
    checkIsKitHold(effect, characterId, GRAND_HYMN_ID),
  );
  const soonestHold = takeOne(
    holds.toSorted((firstHold, secondHold) => firstHold.secondsRemaining - secondHold.secondsRemaining),
    0,
  );
  addKitStatus(kitEffectState, characterId, { id: soonestHold.id, secondsRemaining: seconds });
};

// Key of Khaj-Nisut at its rank: its HP line is the table's. Each Elemental Skill hit adds a stack of the rank's share of the
// Wielder's Max HP as Elemental Mastery, up to three and once every cooldown, each stack running the rank's seconds. Whenever
// The stacks stand at three after a trigger, each other member of the deployed team gains the rank's share of the wielder's Max
// HP as Elemental Mastery for the rank's seconds, and a trigger at three restarts that buff
export const createSunkenSongOfTheSandsPassiveModule = (params: number[]): WeaponPassiveModule => {
  const stackShare = takeOne(params, 1);
  const stackSeconds = takeOne(params, 2);
  const cooldownSeconds = takeOne(params, 3);
  const teamShare = takeOne(params, 4);
  const teamSeconds = takeOne(params, 5);
  return {
    getPassiveBonuses: (combatant, _healthShare, _deployedCombatants, effects) => [
      {
        amount:
          countKitHolds(effects, combatant.characterId, GRAND_HYMN_ID) *
          stackShare *
          combatant.attributes.attributeTotalMap[Attribute.Health],
        attribute: Attribute.ElementalMastery,
      },
    ],
    onKitEvent: (event, { kitEffectState, party }, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        event.attackTag !== AttackTag.ElementalSkill ||
        checkIsKitStatusActive(kitEffectState.effects, combatant.characterId, GRAND_HYMN_COOLDOWN_ID)
      )
        return;
      const { characterId } = combatant;
      addKitStatus(kitEffectState, characterId, { id: GRAND_HYMN_COOLDOWN_ID, secondsRemaining: cooldownSeconds });
      if (countKitHolds(kitEffectState.effects, characterId, GRAND_HYMN_ID) < GRAND_HYMN_MAXIMUM_STACKS)
        addKitHold(kitEffectState, characterId, {
          id: GRAND_HYMN_ID,
          maximum: GRAND_HYMN_MAXIMUM_STACKS,
          seconds: stackSeconds,
        });
      else refreshSoonestGrandHymnHold(kitEffectState, characterId, stackSeconds);
      if (countKitHolds(kitEffectState.effects, characterId, GRAND_HYMN_ID) < GRAND_HYMN_MAXIMUM_STACKS) return;
      const amount = teamShare * combatant.attributes.attributeTotalMap[Attribute.Health];
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
