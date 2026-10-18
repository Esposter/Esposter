import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { takeOne } from "@esposter/shared";

const PRESS_THE_ADVANTAGE_MAXIMUM_STACKS = 3;
const PRESS_THE_ADVANTAGE_SOURCE = "pressTheAdvantage";

// Press the Advantage at its rank: defeating an opponent its wielder struck raises the wielder's ATK by the rank's percentage
// For the rank's seconds, up to three stacks. Each stack runs on its own timer, so each holds a source of its own, and a
// Defeat at the cap adds none
export const createPressTheAdvantagePassiveModule = (params: number[]): WeaponPassiveModule => {
  const attackPercentage = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  return {
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.EnemyDefeated || event.striker?.characterId !== combatant.characterId) return;
      const { characterId } = combatant;
      const liveSources = new Set(
        context.kitEffectState.effects.flatMap((effect) =>
          effect.kind === "buff" &&
          effect.characterId === characterId &&
          effect.source?.startsWith(PRESS_THE_ADVANTAGE_SOURCE)
            ? [effect.source]
            : [],
        ),
      );
      const source = Array.from(
        { length: PRESS_THE_ADVANTAGE_MAXIMUM_STACKS },
        (_, index) => `${PRESS_THE_ADVANTAGE_SOURCE}${index}`,
      ).find((stackSource) => !liveSources.has(stackSource));
      if (source === undefined) return;
      buffKitMember(context.kitEffectState, characterId, {
        amount: attackPercentage,
        attribute: Attribute.AttackPercent,
        secondsRemaining: seconds,
        source,
      });
    },
  };
};
