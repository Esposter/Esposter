import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { Attribute } from "#src/models/character/Attribute";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import {
  NIGHTSOUL_BLESSING_STATUS_ID,
  NIGHTSOUL_POINTS_ID,
  RESCUE_ESSENTIALS_CAP,
  RESCUE_ESSENTIALS_LUNAR_CHARGED_DAMAGE_BONUS,
} from "#src/services/kit/constants";
import { createNightsoulBlessingStart } from "#src/services/kit/createNightsoulBlessingStart";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

export const IFA_CHARACTER_ID = 10_000_113;

// Constellation 4, Decayed Vessel's Permutation: after her burst, Elemental Mastery is raised by this much
const CONSTELLATION_4_ELEMENTAL_MASTERY = 100;
const CONSTELLATION_4_SECONDS = 15;
// Her Nightsoul points are set to 80 as her blessing is entered, as gcsim (MIT) ifa/skill.go enterNightsoul sets them
const NIGHTSOUL_POINTS = 80;
// Each Rescue Essential adds 1.5% to the party's Swirl and Electro-Charged DMG, per the proud skill 1132101's record
const RESCUE_ESSENTIALS_SWIRL_ELECTRO_CHARGED_DAMAGE_BONUS = 0.015;
const RESCUE_ESSENTIALS_CONSTELLATION_2_THRESHOLD = 60;
const RESCUE_ESSENTIALS_CONSTELLATION_2_MULTIPLIER = 3;
const RESCUE_ESSENTIALS_CONSTELLATION_2_CAP_INCREASE = 50;
// Her blessing drains 0.8 points every six frames, eight a second, as gcsim ifa/skill.go nightsoulPointReduceFunc does
const NIGHTSOUL_DRAIN_PER_SECOND = 8;

// The Rescue Essentials the party's points give her: from Constellation 2, the points above 60 count three times over, and
// The cap is 50 higher, as gcsim's c2BonusPoints and c2CapIncrease (cons.go, lines 29 to 45) give them
const countRescueEssentials = (constellationCount: number, partyPoints: number): number => {
  if (constellationCount < 2) return Math.min(partyPoints, RESCUE_ESSENTIALS_CAP);
  const counted =
    partyPoints +
    Math.max(partyPoints - RESCUE_ESSENTIALS_CONSTELLATION_2_THRESHOLD, 0) *
      RESCUE_ESSENTIALS_CONSTELLATION_2_MULTIPLIER;
  return Math.min(counted, RESCUE_ESSENTIALS_CAP + RESCUE_ESSENTIALS_CONSTELLATION_2_CAP_INCREASE);
};

// Ifa's behaviour: her skill's press enters the Nightsoul Blessing with its points, which drain eight a second, or leaves
// It when she is in it, as gcsim's Skill does. Not built: her Tonic Shot, healing, sedation marks, A4 and
// Constellations, which wait on the Nightsoul hook and the sedation-mark hook, the cooldown her leaving sets, which the kit
// Does not hold, and the hold that plunges from inside the blessing. Her three normal attacks, charged attack, Compound
// Sedation Field's hit, and her low and collision plunges are her record's alone, her high plunge's reach is too, and
// Its timing is unsourced, as the Page records. The low plunge, which gcsim plays only after the Nightsoul Blessing
// Ends, is not gated
// Constellation 1 needs Supporting Fire, the normal attacks of Nightsoul's Blessing, which the state does not give yet
// Constellation 2 counts her Rescue Essentials, as gcsim's cons.go gives it, and its in-game text is not read: the wiki's
// Constellation table lists only levels 1, 3 and 6, and the dump's talent rows, keyed by obfuscated fields, were not decoded
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
  getPartyReactionBonus: (member, { reactionType }, context) => {
    const { effects } = context.kitEffectState;
    if (member.ascension < 1 || !checkHasKitStatus(effects, member.characterId, NIGHTSOUL_BLESSING_STATUS_ID))
      return {};
    const points = countRescueEssentials(
      member.constellationCount,
      getDeployedCharacterIds(context.party).reduce(
        (total, characterId) => total + countKitResource(effects, characterId, NIGHTSOUL_POINTS_ID),
        0,
      ),
    );
    if (reactionType === TransformativeReactionType.Swirl || reactionType === TransformativeReactionType.ElectroCharged)
      return { damageBonus: points * RESCUE_ESSENTIALS_SWIRL_ELECTRO_CHARGED_DAMAGE_BONUS };
    if (reactionType === LunarReactionType.LunarCharged)
      return { damageBonus: points * RESCUE_ESSENTIALS_LUNAR_CHARGED_DAMAGE_BONUS };
    return {};
  },
  skill: { onStart: createNightsoulBlessingStart(NIGHTSOUL_POINTS, NIGHTSOUL_DRAIN_PER_SECOND) },
});
