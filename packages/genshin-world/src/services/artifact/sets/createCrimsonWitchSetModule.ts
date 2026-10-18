import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { ReactionType } from "#src/models/combat/ReactionType";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AmplifyingReactionType } from "#src/models/combat/AmplifyingReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { takeOne } from "@esposter/shared";

const CRIMSON_WITCH_SOURCE = "Crimson Witch";
const CRIMSON_WITCH_STACKS_ID = "crimsonWitchStacks";
// The most stacks the four-piece gives, as its text says
const MAXIMUM_STACKS = 3;
// The transformative reactions the first param raises the wearer's own DMG of
const TRANSFORMATIVE_REACTION_TYPES = new Set<ReactionType>([
  TransformativeReactionType.Overloaded,
  TransformativeReactionType.Burning,
  TransformativeReactionType.Burgeon,
]);

// The stacks the wearer holds. The status they run on is dropped when it runs out, so a lapsed count reads as none, as gcsim's
// Cw4pc status does
const getStacks = (effects: readonly KitEffect[], characterId: number): number =>
  findKitStatus(effects, characterId, CRIMSON_WITCH_STACKS_ID)?.stacks ?? 0;

// Crimson Witch of Flames' four-piece. Its first param raises the DMG its wearer's own Overloaded, Burning and Burgeon deal, and its
// Second the DMG its own Vaporize and Melt deal. Each Elemental Skill the wearer uses while it is the active character adds a stack,
// up to three, which raises the Pyro DMG Bonus the two-piece gives by the fourth param of its Pyro DMG Bonus per stack, for the fifth
// Param's seconds from that skill, as gcsim's (MIT) internal/artifacts/crimson/crimson.go does. The two-piece bonus is attributes only
export const createCrimsonWitchSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const transformativeDamageBonus = takeOne(bonus.params, 0);
  const ampedDamageBonus = takeOne(bonus.params, 1);
  const pyroDamageBonus = takeOne(bonus.params, 2);
  const stackPyroDamageRatio = takeOne(bonus.params, 3);
  const stackSeconds = takeOne(bonus.params, 4);
  return {
    getPartyReactionBonus: (member, { combatant, reactionType }) => {
      if (member.characterId !== combatant.characterId) return {};
      if (TRANSFORMATIVE_REACTION_TYPES.has(reactionType)) return { damageBonus: transformativeDamageBonus };
      if (reactionType === AmplifyingReactionType.Vaporize || reactionType === AmplifyingReactionType.Melt)
        return { damageBonus: ampedDamageBonus };
      return {};
    },
    onKitEvent: (event, { kitEffectState, party }, combatant) => {
      if (event.kind !== KitEventKind.SkillUsed) return;
      const { characterId } = combatant;
      if (event.characterId !== characterId || getActiveCharacterId(party) !== characterId) return;
      const stacks = Math.min(getStacks(kitEffectState.effects, characterId) + 1, MAXIMUM_STACKS);
      addKitStatus(kitEffectState, characterId, {
        id: CRIMSON_WITCH_STACKS_ID,
        secondsRemaining: stackSeconds,
        stacks,
      });
      buffKitMember(kitEffectState, characterId, {
        amount: pyroDamageBonus * stackPyroDamageRatio * stacks,
        attribute: Attribute.PyroDamageBonus,
        secondsRemaining: stackSeconds,
        source: CRIMSON_WITCH_SOURCE,
      });
    },
  };
};
