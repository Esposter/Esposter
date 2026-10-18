import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { takeOne } from "@esposter/shared";

const HEART_OF_THE_FURNACE_STELLAR_ID = "heartOfTheFurnaceStellar";
const HEART_OF_THE_FURNACE_SOURCE = "Heart of the Furnace";

// Heart of the Furnace's four-piece. When its wearer triggers a Stellar Swirl, the wearer gets the first param's ATK for the third
// Param's seconds, and every party member's Stellar Swirl DMG is raised by the second param for the same seconds. Both come whether or
// Not the wearer is on the field, as gcsim's furnace reads the wearer's own event. Stellar-Conduct joins the trigger and the DMG once
// Round G lands its damage site, and until then only the Stellar Swirl is read
export const createHeartOfTheFurnaceSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const attackPercent = takeOne(bonus.params, 0);
  const stellarDamageBonus = takeOne(bonus.params, 1);
  const seconds = takeOne(bonus.params, 2);
  return {
    getPartyReactionBonus: (member, { reactionType }, { kitEffectState }) =>
      reactionType === StellarReactionType.StellarSwirl &&
      checkIsKitStatusActive(kitEffectState.effects, member.characterId, HEART_OF_THE_FURNACE_STELLAR_ID)
        ? { damageBonus: stellarDamageBonus }
        : {},
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.ReactionTriggered || event.striker.characterId !== combatant.characterId) return;
      if (!event.reactions.some(({ reactionType }) => reactionType === StellarReactionType.StellarSwirl)) return;
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
