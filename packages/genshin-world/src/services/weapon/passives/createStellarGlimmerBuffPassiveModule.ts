import type { PassiveModule } from "#src/models/kit/PassiveModule";

import type { Attribute } from "#src/models/character/Attribute";

import { checkIsStellarGlimmerReaction } from "#src/services/kit/checkIsStellarGlimmerReaction";
import { createReactionBuffPassiveModule } from "#src/services/weapon/passives/createReactionBuffPassiveModule";
import { takeOne } from "@esposter/shared";

// A passive that, after its wielder triggers a Stellar Glimmer reaction whether or not the wielder is on the field, raises
// One of its Attributes by the rank's amount for the rank's seconds
export const createStellarGlimmerBuffPassiveModule = (
  params: number[],
  { attribute, source }: { attribute: Attribute; source: string },
): PassiveModule =>
  // The buff takes no Ascendant Gleam amount
  createReactionBuffPassiveModule([takeOne(params, 0), takeOne(params, 1), 0], {
    attribute,
    checkIsTriggering: (reactions) => reactions.some((reaction) => checkIsStellarGlimmerReaction(reaction)),
    source,
  });
