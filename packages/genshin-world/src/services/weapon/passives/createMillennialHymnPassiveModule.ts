import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { checkIsReactionNamed } from "#src/services/weapon/passives/checkIsReactionNamed";
import { takeOne } from "@esposter/shared";

const PRAYER_OF_THE_FAR_NORTH_ID = "prayerOfTheFarNorth";
const NEW_MOON_VERSE_ID = "newMoonVerse";
const LUNAR_BLOOM_REACTIONS = [{ reactionType: ReactionType.LunarBloom }];

// Millennial Hymn at its rank: an Elemental Skill of Hydro or Dendro the wielder deals gives Prayer of the Far North, Elemental
// Mastery for the rank's first seconds, and a Lunar-Bloom a nearby member triggers gives New Moon Verse, Elemental Mastery for
// The rank's second seconds, on the wielder off the field too. With both in effect, every Bloom reaction of the party gains
// The rank's Bloom amount, a Hyperbloom or Burgeon the rank's second, and a Lunar-Bloom the rank's third, not stacking
export const createMillennialHymnPassiveModule = (params: number[]): PassiveModule => {
  const prayerElementalMastery = takeOne(params, 0);
  const newMoonSeconds = takeOne(params, 1);
  const newMoonElementalMastery = takeOne(params, 2);
  const prayerSeconds = takeOne(params, 3);
  const bloomBonus = takeOne(params, 4);
  const hyperbloomBurgeonBonus = takeOne(params, 5);
  const lunarBloomBonus = takeOne(params, 6);
  return {
    getPartyReactionBonus: (member, { reactionType }, context) => {
      const { effects } = context.kitEffectState;
      if (
        !checkIsKitStatusActive(effects, member.characterId, PRAYER_OF_THE_FAR_NORTH_ID) ||
        !checkIsKitStatusActive(effects, member.characterId, NEW_MOON_VERSE_ID)
      )
        return {};
      switch (reactionType) {
        case ReactionType.Bloom:
          return { damageBonus: bloomBonus };
        case ReactionType.Burgeon:
        case ReactionType.Hyperbloom:
          return { damageBonus: hyperbloomBurgeonBonus };
        case ReactionType.LunarBloom:
          return { damageBonus: lunarBloomBonus };
        default:
          return {};
      }
    },
    onKitEvent: (event, context, combatant) => {
      const { characterId } = combatant;
      if (
        event.kind === KitEventKind.EnemyHit &&
        event.striker.characterId === characterId &&
        event.attackTag === AttackTag.ElementalSkill &&
        (event.element === Element.Hydro || event.element === Element.Dendro)
      ) {
        addKitStatus(context.kitEffectState, characterId, {
          id: PRAYER_OF_THE_FAR_NORTH_ID,
          secondsRemaining: prayerSeconds,
        });
        buffKitMember(context.kitEffectState, characterId, {
          amount: prayerElementalMastery,
          attribute: Attribute.ElementalMastery,
          secondsRemaining: prayerSeconds,
          source: PRAYER_OF_THE_FAR_NORTH_ID,
        });
      } else if (
        event.kind === KitEventKind.ReactionTriggered &&
        event.striker.characterId !== characterId &&
        checkIsReactionNamed(event.reactions, LUNAR_BLOOM_REACTIONS)
      ) {
        addKitStatus(context.kitEffectState, characterId, { id: NEW_MOON_VERSE_ID, secondsRemaining: newMoonSeconds });
        buffKitMember(context.kitEffectState, characterId, {
          amount: newMoonElementalMastery,
          attribute: Attribute.ElementalMastery,
          secondsRemaining: newMoonSeconds,
          source: NEW_MOON_VERSE_ID,
        });
      }
    },
  };
};
