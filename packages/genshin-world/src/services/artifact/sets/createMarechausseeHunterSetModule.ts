import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";
import { takeOne } from "@esposter/shared";

const MARECHAUSSEE_HUNTER_HOLD_ID = "marechausseeHunterCriticalRate";

// Marechaussee Hunter. Its two-piece bonus raises the DMG its wearer's Normal and Charged Attacks deal by the table's first
// Param. Its four-piece bonus adds a CRIT Rate hold of the first param's share each time its wearer's current HP changes,
// Each running the second param's seconds, up to the third param's count. The holds are Focus's kind, each on its own clock
export const createMarechausseeHunterSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const { params } = bonus;
  if (bonus.pieceCount === 2) {
    const damageBonus = takeOne(params, 0);
    return {
      getStrikeDamageBonus: (strike) =>
        strike.attackTag === AttackTag.NormalAttack || strike.attackTag === AttackTag.ChargedAttack ? damageBonus : 0,
    };
  }
  const criticalRateBonus = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  const maximum = takeOne(params, 2);
  return {
    getPassiveBonuses: (combatant, _healthShare, _deployedCombatants, effects) => [
      {
        amount: criticalRateBonus * countKitHolds(effects, combatant.characterId, MARECHAUSSEE_HUNTER_HOLD_ID),
        attribute: Attribute.CriticalRate,
      },
    ],
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.HealthChanged || event.characterId !== combatant.characterId) return;
      addKitHold(context.kitEffectState, combatant.characterId, { id: MARECHAUSSEE_HUNTER_HOLD_ID, maximum, seconds });
    },
  };
};
