import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { takeOne } from "@esposter/shared";

const BLOODSTAINED_CHIVALRY_STATUS_ID = "bloodstainedChivalry";

// Bloodstained Chivalry. Its four-piece bonus, once its wearer defeats an opponent while it is the active character, raises
// the DMG of its Charged Attacks by the table's second param and reduces their stamina cost to none, for the first param's
// Seconds. The wiki counts a defeat by wildlife too, and a swap off the field does not end it. The table's last two params
// Are not read, as the text names neither
export const createBloodstainedChivalrySetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const seconds = takeOne(bonus.params, 0);
  const damageBonus = takeOne(bonus.params, 1);
  return {
    getChargedAttackStaminaMultiplier: ({ activeCombatant, kitEffectState }) =>
      checkIsKitStatusActive(kitEffectState.effects, activeCombatant.characterId, BLOODSTAINED_CHIVALRY_STATUS_ID)
        ? 0
        : 1,
    getStrikeDamageBonus: (strike, _enemy, _party, effects) =>
      strike.attackTag === AttackTag.ChargedAttack &&
      checkIsKitStatusActive(effects, strike.combatant.characterId, BLOODSTAINED_CHIVALRY_STATUS_ID)
        ? damageBonus
        : 0,
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.EnemyDefeated && event.kind !== KitEventKind.WildlifeStruck) return;
      if (
        event.striker?.characterId !== combatant.characterId ||
        getActiveCharacterId(context.party) !== combatant.characterId
      )
        return;
      addKitStatus(context.kitEffectState, combatant.characterId, {
        id: BLOODSTAINED_CHIVALRY_STATUS_ID,
        secondsRemaining: seconds,
      });
    },
  };
};
