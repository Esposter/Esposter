import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { checkIsReactionNamed } from "#src/services/weapon/passives/checkIsReactionNamed";
import { takeOne } from "@esposter/shared";

const MIND_IN_BLOOM_COOLDOWN_ID = "mindInBloomCooldown";
const MIND_IN_BLOOM_SOURCE = "mindInBloom";
const MIND_IN_BLOOM_REACTIONS = [
  { reactionType: ReactionType.ElectroCharged },
  { reactionType: ReactionType.LunarCharged },
  { reactionType: ReactionType.Bloom },
  { reactionType: ReactionType.LunarBloom },
  { reactionType: ReactionType.Crystallize },
  { reactionType: ReactionType.LunarCrystallize },
];

// Mind in Bloom at its rank: a reaction of those names that anyone in the party triggers, even off the field, restores
// Energy the rank gives its wielder, and raises its Elemental Mastery by the rank's amount for the rank's seconds.
// At most once every cooldown the rank gives in seconds
export const createMindInBloomPassiveModule = (params: number[]): PassiveModule => {
  const energy = takeOne(params, 0);
  const elementalMastery = takeOne(params, 1);
  const seconds = takeOne(params, 2);
  const cooldownSeconds = takeOne(params, 3);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.ReactionTriggered ||
        !checkIsReactionNamed(event.reactions, MIND_IN_BLOOM_REACTIONS) ||
        !startKitCooldown(context.kitEffectState, combatant.characterId, MIND_IN_BLOOM_COOLDOWN_ID, cooldownSeconds)
      )
        return;
      gainPartyMemberEnergy(context.party, combatant, energy);
      buffKitMember(context.kitEffectState, combatant.characterId, {
        amount: elementalMastery,
        attribute: Attribute.ElementalMastery,
        secondsRemaining: seconds,
        source: MIND_IN_BLOOM_SOURCE,
      });
    },
  };
};
