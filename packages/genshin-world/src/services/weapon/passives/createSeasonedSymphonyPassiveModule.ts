import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { takeOne } from "@esposter/shared";

// Seasoned Symphony at its rank: the wielder's ATK rises by the rank's percentage, and by the second percentage more while
// It is off-field. A heal the wielder initiates gives the wielder and the character it healed Sweet Echoes, the third
// Percentage of ATK for the rank's seconds, which a heal triggers whether or not the wielder is on the field
export const createSeasonedSymphonyPassiveModule = (params: number[]): WeaponPassiveModule => {
  const attackPercent = takeOne(params, 0);
  const offFieldAttackPercent = takeOne(params, 1);
  const sweetEchoesAttackPercent = takeOne(params, 2);
  const sweetEchoesSeconds = takeOne(params, 3);
  return {
    getPassiveBonuses: (combatant, _healthShare, deployedCombatants) => {
      const isOnField =
        deployedCombatants.find((member) => member.characterId === combatant.characterId)?.isOnField ?? false;
      return [{ amount: attackPercent + (isOnField ? 0 : offFieldAttackPercent), attribute: Attribute.AttackPercent }];
    },
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.HealthChanged ||
        event.healthShare <= 0 ||
        event.sourceCharacterId !== combatant.characterId
      )
        return;
      for (const characterId of new Set([combatant.characterId, event.characterId]))
        buffKitMember(kitEffectState, characterId, {
          amount: sweetEchoesAttackPercent,
          attribute: Attribute.AttackPercent,
          secondsRemaining: sweetEchoesSeconds,
          source: "sweetEchoes",
        });
    },
  };
};
