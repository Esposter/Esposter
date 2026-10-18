import type { Element } from "#src/models/Element";
import type { ReactionType } from "#src/models/combat/ReactionType";
import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { takeOne } from "@esposter/shared";

const REACTION_ATTACK_SECONDS = 12;

// A passive that raises its wielder's ATK by the rank's percentage for twelve seconds when the wielder triggers one of the
// Reactions it names, a Swirl named by the element it infuses
export const createReactionAttackPassiveModule = (
  reactions: { element?: Element; reactionType: ReactionType }[],
  params: number[],
): WeaponPassiveModule => {
  const attackPercentage = takeOne(params, 0);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.ReactionTriggered ||
        event.striker.characterId !== combatant.characterId ||
        !event.reactions.some((triggered) =>
          reactions.some(
            (named) =>
              named.reactionType === triggered.reactionType &&
              (named.element === undefined || named.element === triggered.element),
          ),
        )
      )
        return;
      buffKitMember(kitEffectState, combatant.characterId, {
        amount: attackPercentage,
        attribute: Attribute.AttackPercent,
        secondsRemaining: REACTION_ATTACK_SECONDS,
        source: "reactionAttack",
      });
    },
  };
};
