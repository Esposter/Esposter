import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { checkIsKitShieldLive } from "#src/services/kit/effects/checkIsKitShieldLive";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { takeOne } from "@esposter/shared";

const GOLDEN_MAJESTY_ID = "goldenMajesty";
const GOLDEN_MAJESTY_COOLDOWN_ID = "goldenMajestyCooldown";
// The cooldown and the stack cap the text states rather than the rank's numbers
const GOLDEN_MAJESTY_COOLDOWN_SECONDS = 0.3;
const GOLDEN_MAJESTY_MAXIMUM_STACKS = 5;
const PROTECTED_MULTIPLIER = 2;

// Golden Majesty at its rank: the wielder's Shield Strength rises by the rank's percentage. Each hit it scores adds a stack of
// The rank's ATK, up to five and once every 0.3 seconds, each stack running the rank's seconds. While the wielder is on the
// Field and protected by a shield, the stacks' ATK is doubled
export const createGoldenMajestyPassiveModule = (params: number[]): PassiveModule => {
  const shieldStrength = takeOne(params, 0);
  const attackPerStack = takeOne(params, 1);
  const stackSeconds = takeOne(params, 2);
  return {
    getPassiveBonuses: (combatant, _healthShare, deployedCombatants, effects) => {
      const isOnField =
        deployedCombatants.find((member) => member.characterId === combatant.characterId)?.isOnField ?? false;
      const isProtected = isOnField && effects.some((effect) => checkIsKitShieldLive(effect));
      return [
        { amount: shieldStrength, attribute: Attribute.ShieldStrength },
        {
          amount:
            attackPerStack *
            countKitHolds(effects, combatant.characterId, GOLDEN_MAJESTY_ID) *
            (isProtected ? PROTECTED_MULTIPLIER : 1),
          attribute: Attribute.AttackPercent,
        },
      ];
    },
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        !startKitCooldown(
          kitEffectState,
          combatant.characterId,
          GOLDEN_MAJESTY_COOLDOWN_ID,
          GOLDEN_MAJESTY_COOLDOWN_SECONDS,
        )
      )
        return;
      addKitHold(kitEffectState, combatant.characterId, {
        id: GOLDEN_MAJESTY_ID,
        maximum: GOLDEN_MAJESTY_MAXIMUM_STACKS,
        seconds: stackSeconds,
      });
    },
  };
};
