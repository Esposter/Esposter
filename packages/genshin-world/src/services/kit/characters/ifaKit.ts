import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { Attribute } from "#src/models/character/Attribute";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { exitKitNightsoulBlessing } from "#src/services/kit/effects/exitKitNightsoulBlessing";
import { hasKitNightsoulBlessing } from "#src/services/kit/effects/hasKitNightsoulBlessing";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

export const IFA_CHARACTER_ID = 10_000_113;

// Constellation 4, Decayed Vessel's Permutation: after her burst, Elemental Mastery is raised by this much
const CONSTELLATION_4_ELEMENTAL_MASTERY = 100;
const CONSTELLATION_4_SECONDS = 15;
// Her Nightsoul points are set to 80 as her blessing is entered, as gcsim (MIT) ifa/skill.go enterNightsoul sets them
const NIGHTSOUL_POINTS = 80;
// Her Rescue Essentials, her A1, are the Nightsoul points of her whole party, up to 150, held while her blessing lasts, as
// The wiki's passive text and gcsim's team sum give them. Each one adds to the party's Swirl and Electro-Charged DMG 1.5%,
// And to its Lunar-Charged DMG 0.2%, as the proud skill 1132101's record gives the first two and the description (TextMap
// 2399084529) the last
const RESCUE_ESSENTIALS_CAP = 150;
const RESCUE_ESSENTIALS_SWIRL_ELECTRO_CHARGED_DAMAGE_BONUS = 0.015;
const RESCUE_ESSENTIALS_LUNAR_CHARGED_DAMAGE_BONUS = 0.002;
// Her blessing drains 0.8 points every six frames, eight a second, as gcsim ifa/skill.go nightsoulPointReduceFunc does
const NIGHTSOUL_DRAIN_PER_SECOND = 8;

// Ifa's behaviour: her skill's press enters the Nightsoul Blessing with its points, which drain eight a second, or leaves
// It when she is in it, as gcsim's Skill does. Not built: her Tonic Shot, healing, sedation marks, A4 and
// Constellations, which wait on the Nightsoul hook and the sedation-mark hook, the cooldown her leaving sets, which the kit
// Does not hold, and the hold that plunges from inside the blessing. Her three normal attacks, charged attack, Compound
// Sedation Field's hit, and her low and collision plunges are her record's alone, and her high plunge is borrowed as the
// Page records. The low plunge, which gcsim plays only after the Nightsoul Blessing ends, is not gated
// Constellation 1 needs Supporting Fire, the normal attacks of Nightsoul's Blessing, which the state does not give yet
// Constellation 2 is not built: the wiki's page has no text for it, its Constellation table listing only levels 1, 3 and 6,
// And wiki.gg could not be read to fill the gap
// Constellation 4's wind current lasts three seconds more, which waits on a restraining field the burst lacks
// Constellation 6 needs the Hold of Supporting Fire and its Nightsoul's Blessing turns, which the kit does not build
// Her A1 is the party reaction hook's, and its Rescue Essentials last only while her blessing does. The Stellar Swirl value
// Is not built, as the record gives it zero, and nearby is not modelled, as gcsim does not model it either
export const createIfaKitBehaviour = (): KitBehaviour => ({
  burst: {
    onStart: ({ activeCombatant: combatant, kitEffectState }) => {
      if (combatant.constellationCount >= 4)
        buffKitMember(kitEffectState, combatant.characterId, {
          amount: CONSTELLATION_4_ELEMENTAL_MASTERY,
          attribute: Attribute.ElementalMastery,
          secondsRemaining: CONSTELLATION_4_SECONDS,
        });
    },
  },
  skill: {
    onStart: ({ activeCombatant, kitEffectState }) => {
      const { characterId } = activeCombatant;
      if (hasKitNightsoulBlessing(kitEffectState.effects, characterId))
        exitKitNightsoulBlessing(kitEffectState, characterId);
      else
        enterKitNightsoulBlessing(kitEffectState, characterId, {
          nightsoulRate: { maximum: NIGHTSOUL_POINTS, perSecond: -NIGHTSOUL_DRAIN_PER_SECOND },
          points: NIGHTSOUL_POINTS,
          secondsRemaining: Number.POSITIVE_INFINITY,
        });
    },
  },
  getPartyReactionBonus: (member, { reactionType }, context) => {
    const { effects } = context.kitEffectState;
    if (member.ascension < 1 || !hasKitNightsoulBlessing(effects, member.characterId)) return {};
    const points = Math.min(
      getDeployedCharacterIds(context.party).reduce(
        (total, characterId) => total + countKitResource(effects, characterId, NIGHTSOUL_POINTS_ID),
        0,
      ),
      RESCUE_ESSENTIALS_CAP,
    );
    if (reactionType === TransformativeReactionType.Swirl || reactionType === TransformativeReactionType.ElectroCharged)
      return { damageBonus: points * RESCUE_ESSENTIALS_SWIRL_ELECTRO_CHARGED_DAMAGE_BONUS };
    if (reactionType === LunarReactionType.LunarCharged)
      return { damageBonus: points * RESCUE_ESSENTIALS_LUNAR_CHARGED_DAMAGE_BONUS };
    return {};
  },
});
