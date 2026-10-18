import type { Element } from "#src/models/Element";
import type { ReactionType } from "#src/models/combat/ReactionType";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { checkIsReactionNamed } from "#src/services/weapon/passives/checkIsReactionNamed";
import { createReactionBuffPassiveModule } from "#src/services/weapon/passives/createReactionBuffPassiveModule";
import { takeOne } from "@esposter/shared";

const REACTION_ATTACK_SECONDS = 12;

// A passive that raises its wielder's ATK by the rank's percentage for twelve seconds when the wielder triggers one of the
// Reactions it names, a Swirl named by the element it infuses
export const createReactionAttackPassiveModule = (
  reactions: { element?: Element; reactionType: ReactionType }[],
  params: number[],
): PassiveModule =>
  // The buff takes no Ascendant Gleam amount
  createReactionBuffPassiveModule([takeOne(params, 0), REACTION_ATTACK_SECONDS, 0], {
    attribute: Attribute.AttackPercent,
    checkIsTriggering: (triggered) => checkIsReactionNamed(triggered, reactions),
    source: "reactionAttack",
  });
