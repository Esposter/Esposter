import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";

export const SIGEWINNE_CHARACTER_ID = 10_000_095;

// The phase Semi-Strict Bedrest opens at, the first of her two ascension passives
const ASCENSION_1 = 1;
// Semi-Strict Bedrest, from Ascension 1: each press of Rebound Hydrotherapy gives her an 8% Hydro DMG Bonus for 18
// Seconds, as the description of proud skill group 9521 gives it, and gcsim v2.47.2 (MIT) sigewinne/asc.go's a1Self,
// Which holds it for the skill's cooldown
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sigewinne/asc.go
const SEMI_STRICT_BEDREST_HYDRO_DAMAGE_BONUS = 0.08;
const SEMI_STRICT_BEDREST_SECONDS = 18;
const SEMI_STRICT_BEDREST_SOURCE = "sigewinne-semi-strict-bedrest";

// Sigewinne's behaviour: the press casts Bolstering Bubblebalm where she stands, its bubble's bounces landing from
// There, each a share of her Max HP as the striker's is when priced, and from Ascension 1 the press also gives her
// The Hydro DMG Bonus of Semi-Strict Bedrest. Its healing, its hold's bubble tiers and the Fully-Charged Aimed Shot's
// Second level, the Mini-Stration Bubble, are not built
// Ascension 1's Convalescence stacks, which add to the Elemental Skill DMG of her off-field members, need a flat bonus
// On those members' skill hits, which no kit reaches, so they are not built
// Ascension 4 raises the healing she performs, which the kit does not build, and a heal reads the healed
// HealingBonus rather than its healer's, so no hook raises her own heals
// Constellation 1 needs three extra bounces of Bolstering Bubblebalm and the shrink rule, which the kit does not build
// Constellation 2 needs the Bubbly Shield from Rebound Hydrotherapy and Super Saturated Syringing, not built
// Constellation 4 needs Super Saturated Syringing, the burst, which the kit does not build
// Constellation 6 needs Super Saturated Syringing's CRIT Rate and CRIT DMG from her Max HP, not built
export const createSigewinneKitBehaviour = ({ readHits }: KitRecordReader): KitBehaviour => {
  const bolsteringBubblebalmHits = readHits("bolsteringBubblebalmBounces");
  return {
    skill: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        castKitSummon(kitEffectState, body, combatant, bolsteringBubblebalmHits);
        if (combatant.ascension < ASCENSION_1) return;
        buffKitMember(kitEffectState, combatant.characterId, {
          amount: SEMI_STRICT_BEDREST_HYDRO_DAMAGE_BONUS,
          attribute: Attribute.HydroDamageBonus,
          secondsRemaining: SEMI_STRICT_BEDREST_SECONDS,
          source: SEMI_STRICT_BEDREST_SOURCE,
        });
      },
    },
  };
};
