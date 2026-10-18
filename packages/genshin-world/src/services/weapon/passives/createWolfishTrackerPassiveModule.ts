import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { takeOne } from "@esposter/shared";

const WOLFISH_TRACKER_COOLDOWN_ID = "wolfishTrackerCooldown";
const WOLFISH_TRACKER_COOLDOWN_SECONDS = 30;
const WOLFISH_TRACKER_HEALTH_SHARE = 0.3;
const WOLFISH_TRACKER_SECONDS = 12;

// Wolf's Gravestone's Wolfish Tracker at its rank: its wielder's ATK is raised by the rank's percentage.
// A hit the wielder deals on an enemy under thirty per cent of its HP raises the deployed team's ATK by the rank's second
// Percentage for twelve seconds, once every thirty seconds. The seconds and the thirty per cent are the text's, not the parameter list's
export const createWolfishTrackerPassiveModule = (params: number[]): WeaponPassiveModule => {
  const attackPercent = takeOne(params, 0);
  const teamAttackPercent = takeOne(params, 1);
  return {
    getPassiveBonuses: () => [{ amount: attackPercent, attribute: Attribute.AttackPercent }],
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        event.enemy.health >= event.enemy.maxHealth * WOLFISH_TRACKER_HEALTH_SHARE ||
        checkIsKitStatusActive(context.kitEffectState.effects, combatant.characterId, WOLFISH_TRACKER_COOLDOWN_ID)
      )
        return;
      addKitStatus(context.kitEffectState, combatant.characterId, {
        id: WOLFISH_TRACKER_COOLDOWN_ID,
        secondsRemaining: WOLFISH_TRACKER_COOLDOWN_SECONDS,
      });
      buffKitTeam(context.kitEffectState, context.party, {
        amount: teamAttackPercent,
        attribute: Attribute.AttackPercent,
        secondsRemaining: WOLFISH_TRACKER_SECONDS,
        source: "wolfishTracker",
      });
    },
  };
};
