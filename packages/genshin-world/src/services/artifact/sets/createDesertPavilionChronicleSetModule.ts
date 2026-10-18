import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { takeOne } from "@esposter/shared";

const DESERT_PAVILION_CHRONICLE_STATUS_ID = "desertPavilionChronicle";

// Desert Pavilion Chronicle. Its four-piece bonus, once a Charged Attack its wearer deals hits an opponent, raises the wearer's
// Normal Attack SPD by the table's first param and its Normal, Charged and Plunging Attack DMG by the second for the third
// Param's seconds, a later hit restarting them
export const createDesertPavilionChronicleSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const normalAttackSpeedBonus = takeOne(bonus.params, 0);
  const damageBonus = takeOne(bonus.params, 1);
  const seconds = takeOne(bonus.params, 2);
  return {
    getPassiveBonuses: (combatant, _healthShare, _deployedCombatants, effects) => [
      {
        amount: checkIsKitStatusActive(effects, combatant.characterId, DESERT_PAVILION_CHRONICLE_STATUS_ID)
          ? normalAttackSpeedBonus
          : 0,
        attribute: Attribute.NormalAttackSpeed,
      },
    ],
    getStrikeDamageBonus: (strike, _enemy, _party, effects) =>
      (strike.attackTag === AttackTag.NormalAttack ||
        strike.attackTag === AttackTag.ChargedAttack ||
        strike.attackTag === AttackTag.PlungingAttack) &&
      checkIsKitStatusActive(effects, strike.combatant.characterId, DESERT_PAVILION_CHRONICLE_STATUS_ID)
        ? damageBonus
        : 0,
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        event.attackTag !== AttackTag.ChargedAttack
      )
        return;
      addKitStatus(context.kitEffectState, combatant.characterId, {
        id: DESERT_PAVILION_CHRONICLE_STATUS_ID,
        secondsRemaining: seconds,
      });
    },
  };
};
