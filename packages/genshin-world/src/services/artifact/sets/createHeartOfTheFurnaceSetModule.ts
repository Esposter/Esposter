import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { getFirstHolderDamageBonus } from "#src/services/artifact/sets/getFirstHolderDamageBonus";
import { checkIsStellarGlimmerReaction } from "#src/services/kit/checkIsStellarGlimmerReaction";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { takeOne } from "@esposter/shared";

const HEART_OF_THE_FURNACE_STELLAR_ID = "heartOfTheFurnaceStellar";
const HEART_OF_THE_FURNACE_SOURCE = "Heart of the Furnace";

// Heart of the Furnace's four-piece. When its wearer triggers a Stellar
// Swirl, the wearer gets the first param's ATK for the third param's seconds, and the party's
// Stellar Swirl DMG is raised by the second param for the same seconds, given once over the party.
// However many wearers hold it, as the set's effect does not stack.
// Both come whether or not the wearer is on the field, as gcsim's Furnace reads the wearer's own event.
// A Stellar-Conduct the wearer triggers does the same, and its DMG Bonus lands on the direct
// Stellar-Conduct hits a kit deals.
export const createHeartOfTheFurnaceSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const attackPercent = takeOne(bonus.params, 0);
  const stellarDamageBonus = takeOne(bonus.params, 1);
  const seconds = takeOne(bonus.params, 2);
  return {
    getPartyReactionBonus: (member, { reactionType }, context) =>
      checkIsStellarGlimmerReaction({ reactionType })
        ? getFirstHolderDamageBonus(member, HEART_OF_THE_FURNACE_STELLAR_ID, stellarDamageBonus, context)
        : {},
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.ReactionTriggered || event.striker.characterId !== combatant.characterId) return;
      if (!event.reactions.some((reaction) => checkIsStellarGlimmerReaction(reaction))) return;
      const { characterId } = combatant;
      buffKitMember(kitEffectState, characterId, {
        amount: attackPercent,
        attribute: Attribute.AttackPercent,
        secondsRemaining: seconds,
        source: HEART_OF_THE_FURNACE_SOURCE,
      });
      addKitStatus(kitEffectState, characterId, { id: HEART_OF_THE_FURNACE_STELLAR_ID, secondsRemaining: seconds });
    },
  };
};
