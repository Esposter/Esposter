import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { takeOne } from "@esposter/shared";

const SCARLETPROOF_SOURCE = "Scarletproof";
const SCARLETPROOF_STELLAR_SWIRL_ID = "scarletproofStellarSwirl";

// Scarletproof's four-piece. A Stellar Swirl its wearer triggers, from any source of the wearer's, summons' among them as gcsim's
// OnStellarSwirl takes any attack of the wearer's, raises the wearer's CRIT Rate by the first param and its Stellar Swirl DMG by the
// Second, for the third param's seconds from that swirl, each restarted rather than stacked. The swirl that sets them off is priced
// Without them, as the wiki's and gcsim's hooks read them after it
export const createScarletproofSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const criticalRateBonus = takeOne(bonus.params, 0);
  const stellarSwirlDamageBonus = takeOne(bonus.params, 1);
  const seconds = takeOne(bonus.params, 2);
  return {
    getPartyReactionBonus: (member, { combatant, reactionType }, context) => {
      if (member.characterId !== combatant.characterId || reactionType !== StellarReactionType.StellarSwirl) return {};
      return checkIsKitStatusActive(
        context.kitEffectState.effects,
        combatant.characterId,
        SCARLETPROOF_STELLAR_SWIRL_ID,
      )
        ? { damageBonus: stellarSwirlDamageBonus }
        : {};
    },
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.ReactionTriggered || event.striker.characterId !== combatant.characterId) return;
      if (!event.reactions.some(({ reactionType }) => reactionType === StellarReactionType.StellarSwirl)) return;
      const { characterId } = combatant;
      addKitStatus(kitEffectState, characterId, { id: SCARLETPROOF_STELLAR_SWIRL_ID, secondsRemaining: seconds });
      buffKitMember(kitEffectState, characterId, {
        amount: criticalRateBonus,
        attribute: Attribute.CriticalRate,
        secondsRemaining: seconds,
        source: SCARLETPROOF_SOURCE,
      });
    },
  };
};
