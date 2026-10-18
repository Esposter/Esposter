import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { createAttackTagDamageSetModule } from "#src/services/artifact/sets/createAttackTagDamageSetModule";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";

const RADIANCE_EVERLASTING_ID = "longNightsOathRadianceEverlasting";

// Each attack's own trigger cooldown, so a Plunging Attack's trigger does not hold back a Charged Attack's
const getTriggerCooldownId = (attackTag: AttackTag): string =>
  `longNightsOathTriggerCooldown${ID_SEPARATOR}${attackTag}`;

// Long Night's Oath. Its two-piece bonus raises the DMG of its wearer's Plunging Attacks by the table's first param. Its
// Four-piece bonus gives the wearer, while it stands on the field, stacks of Radiance Everlasting after each hit of an enemy by its
// Plunging Attack, Charged Attack or Elemental Skill, one, two and two, and each attack type triggers once every sixth-param seconds.
// A stack raises its Plunging Attacks' DMG by the fourth param for the fifth param's seconds, counted on its own, up to the seventh
// Param, and a stack past that replaces the one that runs out first
export const createLongNightsOathSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const { params } = bonus;
  if (bonus.pieceCount === 2)
    return createAttackTagDamageSetModule({ amount: takeOne(params, 0), attackTag: AttackTag.PlungingAttack });
  const stacksByAttackTag = new Map<AttackTag, number>([
    [AttackTag.PlungingAttack, takeOne(params, 0)],
    [AttackTag.ChargedAttack, takeOne(params, 1)],
    [AttackTag.ElementalSkill, takeOne(params, 2)],
  ]);
  const damageBonusPerStack = takeOne(params, 3);
  const stackSeconds = takeOne(params, 4);
  const cooldownSeconds = takeOne(params, 5);
  const maximumStacks = takeOne(params, 6);
  return {
    getStrikeDamageBonus: (strike, _enemy, _party, effects) =>
      strike.attackTag === AttackTag.PlungingAttack
        ? damageBonusPerStack * countKitHolds(effects, strike.combatant.characterId, RADIANCE_EVERLASTING_ID)
        : 0,
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.DamageTaken || event.striker.characterId !== combatant.characterId) return;
      const { attackTag } = event;
      const stacks = attackTag === undefined ? undefined : stacksByAttackTag.get(attackTag);
      if (attackTag === undefined || stacks === undefined) return;
      const { characterId } = combatant;
      const { kitEffectState, party } = context;
      if (getActiveCharacterId(party) !== characterId) return;
      if (checkIsKitStatusActive(kitEffectState.effects, characterId, getTriggerCooldownId(attackTag))) return;
      addKitStatus(kitEffectState, characterId, {
        id: getTriggerCooldownId(attackTag),
        secondsRemaining: cooldownSeconds,
      });
      for (let stackIndex = 0; stackIndex < stacks; stackIndex++)
        addKitHold(kitEffectState, characterId, {
          id: RADIANCE_EVERLASTING_ID,
          maximum: maximumStacks,
          replacesOldest: true,
          seconds: stackSeconds,
        });
    },
  };
};
