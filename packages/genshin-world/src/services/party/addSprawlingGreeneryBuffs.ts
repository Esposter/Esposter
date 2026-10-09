import type { Reaction } from "#src/models/combat/Reaction";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { SPRAWLING_GREENERY_SECONDS } from "#src/services/party/constants";
import { ReactionElementalMasteryMap } from "#src/services/party/ReactionElementalMasteryMap";

// Sprawling Greenery's timed Elemental Mastery: while the deployed team holds Dendro's resonance, each
// Reaction a strike triggers gives every party member its Elemental Mastery for six seconds. Each amount is
// Its own buff, restarted only by another of the same amount, and running beside the other, as the wiki
// Counts their durations on their own.
export const addSprawlingGreeneryBuffs = (
  kitEffectState: KitEffectState,
  party: Party,
  combatant: Combatant,
  reactions: Reaction[],
): void => {
  if (!combatant.elementalResonances.includes(Element.Dendro)) return;
  for (const { reactionType } of reactions) {
    const amount = ReactionElementalMasteryMap[reactionType];
    if (amount === undefined) continue;
    for (const characterId of party.teams[party.deployedTeamIndex]?.characterIds ?? [])
      addKitEffect(kitEffectState, {
        amount,
        attribute: Attribute.ElementalMastery,
        characterId,
        kind: "buff",
        secondsRemaining: SPRAWLING_GREENERY_SECONDS,
        source: `Sprawling Greenery ${amount}`,
      });
  }
};
