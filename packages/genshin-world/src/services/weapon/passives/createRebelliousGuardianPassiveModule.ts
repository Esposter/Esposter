import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { takeOne } from "@esposter/shared";

const REBELLIOUS_GUARDIAN_COOLDOWN_ID = "rebelliousGuardianCooldown";
const REBELLIOUS_GUARDIAN_SECONDS = 10;

// The Bell's Rebellious Guardian at its rank: an enemy's strike that takes the wielder's HP generates a shield of the rank's
// Share of its Max HP for ten seconds, and the wielder gains the rank's DMG Bonus. A shield holds off the next for the
// Rank's cooldown in seconds. The bonus lasts the shield's ten seconds, not ending when the shield breaks
export const createRebelliousGuardianPassiveModule = (params: number[]): WeaponPassiveModule => {
  const shareOfMaxHealth = takeOne(params, 0);
  const cooldownSeconds = takeOne(params, 1);
  const damageBonus = takeOne(params, 2);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.HealthChanged ||
        event.characterId !== combatant.characterId ||
        event.healthShare >= 0 ||
        event.sourceCharacterId !== undefined ||
        checkIsKitStatusActive(context.kitEffectState.effects, combatant.characterId, REBELLIOUS_GUARDIAN_COOLDOWN_ID)
      )
        return;
      addKitStatus(context.kitEffectState, combatant.characterId, {
        id: REBELLIOUS_GUARDIAN_COOLDOWN_ID,
        secondsRemaining: cooldownSeconds,
      });
      castKitShield(context.kitEffectState, combatant.characterId, {
        health: shareOfMaxHealth * combatant.attributes.maxHealth,
        secondsRemaining: REBELLIOUS_GUARDIAN_SECONDS,
      });
      buffKitMember(context.kitEffectState, combatant.characterId, {
        amount: damageBonus,
        attribute: Attribute.AllDamageBonus,
        secondsRemaining: REBELLIOUS_GUARDIAN_SECONDS,
        source: "rebelliousGuardian",
      });
    },
  };
};
