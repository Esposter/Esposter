import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { takeOne } from "@esposter/shared";

const CONSUMMATION_ID = "consummation";

// Extinguishing Precept at its rank: its All Elemental DMG Bonus is a passive bonus on each element. After the wielder uses an
// Elemental Skill, it obtains Consummation for the rank's seconds, and its ATK rises by the rank's amount for each second that
// Has passed since, up to the rank's stacks, doubled while the wielder is off the field. The stacks are read from the seconds
// The status has left, so they need no clock of their own
export const createExtinguishingPreceptPassiveModule = (params: number[]): WeaponPassiveModule => {
  const elementalDamageBonus = takeOne(params, 0);
  const attackBonusPerSecond = takeOne(params, 2);
  const maximumStacks = takeOne(params, 3);
  const seconds = takeOne(params, 4);
  return {
    getPassiveBonuses: (combatant, _healthShare, deployedCombatants, effects) => {
      const { characterId } = combatant;
      const consummation = findKitStatus(effects, characterId, CONSUMMATION_ID);
      const stacks =
        consummation !== undefined && checkIsKitStatusActive(effects, characterId, CONSUMMATION_ID)
          ? Math.min(maximumStacks, Math.floor(seconds - consummation.secondsRemaining))
          : 0;
      const isOnField = deployedCombatants.some(
        (deployedCombatant) => deployedCombatant.characterId === characterId && deployedCombatant.isOnField,
      );
      return [
        ...ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: elementalDamageBonus, attribute })),
        { amount: stacks * attackBonusPerSecond * (isOnField ? 1 : 2), attribute: Attribute.AttackPercent },
      ];
    },
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.SkillUsed || event.characterId !== combatant.characterId) return;
      addKitStatus(kitEffectState, combatant.characterId, { id: CONSUMMATION_ID, secondsRemaining: seconds });
    },
  };
};
