import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { changeKitCooldown } from "#src/services/kit/effects/changeKitCooldown";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { takeOne } from "@esposter/shared";

const CURSED_PARASOL_ID = "cursedParasol";
const CURSED_PARASOL_COOLDOWN_ID = "kaidanCursedParasolCooldown";

// Kaidan: Rainfall Earthbinder at its rank: an attack hit its wielder lands inflicts Cursed Parasol on the enemy it
// Struck for the Rank's seconds, once every the rank's cooldown in seconds. The wielder deals the rank's amount more
// DMG to that enemy while it Lasts, and an enemy with it defeated refreshes the cooldown
export const createKaidanRainfallEarthbinderPassiveModule = (params: number[]): PassiveModule => {
  const seconds = takeOne(params, 0);
  const damageBonus = takeOne(params, 1);
  const cooldownSeconds = takeOne(params, 2);
  return {
    getStrikeDamageBonus: (_strike, enemy) =>
      enemy.statuses.some(({ id }) => id === CURSED_PARASOL_ID) ? damageBonus : 0,
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind === KitEventKind.DamageTaken &&
        event.striker.characterId === combatant.characterId &&
        event.attackTag !== undefined &&
        startKitCooldown(context.kitEffectState, combatant.characterId, CURSED_PARASOL_COOLDOWN_ID, cooldownSeconds)
      )
        addEnemyStatus(event.enemy, { damageTakenBonus: 0, id: CURSED_PARASOL_ID, secondsRemaining: seconds });
      else if (
        event.kind === KitEventKind.EnemyDefeated &&
        event.striker?.characterId === combatant.characterId &&
        event.enemy.statuses.some(({ id }) => id === CURSED_PARASOL_ID)
      )
        changeKitCooldown(context.kitEffectState, combatant.characterId, CURSED_PARASOL_COOLDOWN_ID, -cooldownSeconds);
    },
  };
};
