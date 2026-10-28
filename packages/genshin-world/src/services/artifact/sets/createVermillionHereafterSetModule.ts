import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitHoldId } from "#src/services/kit/effects/checkIsKitHoldId";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";
import { releaseKitHolds } from "#src/services/kit/effects/releaseKitHolds";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { takeOne } from "@esposter/shared";

const VERMILLION_HEREAFTER_NASCENT_LIGHT_ID = "vermillionHereafterNascentLight";
const VERMILLION_HEREAFTER_INCREASE_ID = "vermillionHereafterIncrease";
const VERMILLION_HEREAFTER_COOLDOWN_ID = "vermillionHereafterCooldown";

// Drops the wearer's Nascent Light and the increases it holds, as a swap off the field or a burst that dispels it does
const clearNascentLight = (kitEffectState: KitEffectState, characterId: number): void => {
  removeKitEffects(
    kitEffectState,
    (effect) =>
      (effect.kind === "status" &&
        effect.characterId === characterId &&
        effect.id === VERMILLION_HEREAFTER_NASCENT_LIGHT_ID) ||
      checkIsKitHoldId(effect, characterId, VERMILLION_HEREAFTER_INCREASE_ID),
  );
};

// Vermillion Hereafter. Its four-piece bonus gives its wearer Nascent Light on casting an Elemental Burst, which raises its
// ATK by the second param for the first param's seconds. Each HP decrease of the wearer's while it stands adds the third param
// More, up to the fourth param of them, and no more often than the fifth param's seconds. The increases end with Nascent Light,
// Which the wearer leaving the field dispels, and a burst cast during it dispels it and starts it again
export const createVermillionHereafterSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const seconds = takeOne(bonus.params, 0);
  const attackBonus = takeOne(bonus.params, 1);
  const attackIncrease = takeOne(bonus.params, 2);
  const maximumIncreases = takeOne(bonus.params, 3);
  const cooldownSeconds = takeOne(bonus.params, 4);
  return {
    getPassiveBonuses: (combatant, _healthShare, _deployedCombatants, effects) => {
      const { characterId } = combatant;
      if (!checkIsKitStatusActive(effects, characterId, VERMILLION_HEREAFTER_NASCENT_LIGHT_ID)) return [];
      return [
        {
          amount: attackBonus + attackIncrease * countKitHolds(effects, characterId, VERMILLION_HEREAFTER_INCREASE_ID),
          attribute: Attribute.AttackPercent,
        },
      ];
    },
    onKitEvent: (event, context, combatant) => {
      const { characterId } = combatant;
      const { kitEffectState } = context;
      if (event.kind === KitEventKind.BurstUsed && event.characterId === characterId) {
        clearNascentLight(kitEffectState, characterId);
        addKitStatus(kitEffectState, characterId, {
          id: VERMILLION_HEREAFTER_NASCENT_LIGHT_ID,
          secondsRemaining: seconds,
        });
        return;
      }
      if (event.kind === KitEventKind.CharacterSwapped && event.previousCharacterId === characterId) {
        clearNascentLight(kitEffectState, characterId);
        return;
      }
      if (
        event.kind === KitEventKind.EffectExpired &&
        event.effect.kind === "status" &&
        event.effect.characterId === characterId &&
        event.effect.id === VERMILLION_HEREAFTER_NASCENT_LIGHT_ID
      ) {
        releaseKitHolds(kitEffectState, characterId, VERMILLION_HEREAFTER_INCREASE_ID);
        return;
      }
      if (
        event.kind === KitEventKind.HealthChanged &&
        event.characterId === characterId &&
        event.healthShare < 0 &&
        checkIsKitStatusActive(kitEffectState.effects, characterId, VERMILLION_HEREAFTER_NASCENT_LIGHT_ID) &&
        startKitCooldown(kitEffectState, characterId, VERMILLION_HEREAFTER_COOLDOWN_ID, cooldownSeconds)
      )
        addKitHold(kitEffectState, characterId, {
          id: VERMILLION_HEREAFTER_INCREASE_ID,
          maximum: maximumIncreases,
          seconds: Number.POSITIVE_INFINITY,
        });
    },
  };
};
