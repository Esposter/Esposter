import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { getKitMaxHealth } from "#src/services/kit/effects/getKitMaxHealth";

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
// Constellation 2, as gcsim v2.47.2 (MIT) sigewinne/cons.go and skill.go, burst.go and shield.go give it: each enemy her
// Bubbles and waves strike loses 35% Hydro RES for 8 seconds, and the press and the burst each cast a Bubbly Shield of 30%
// Of her Max HP, which lasts the action. The shield is cast for the action's seconds, as gcsim ends it when the action's
// Animation is removed
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sigewinne/cons.go
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_HYDRO_RESISTANCE_REDUCTION = 0.35;
const CONSTELLATION_2_SECONDS = 8;
const CONSTELLATION_2_SHIELD_MAX_HEALTH_SHARE = 0.3;
const CONSTELLATION_2_STATUS: EnemyStatus = {
  damageTakenBonus: 0,
  id: "sigewinne-constellation-2",
  resistanceReduction: { [Element.Hydro]: CONSTELLATION_2_HYDRO_RESISTANCE_REDUCTION },
  secondsRemaining: CONSTELLATION_2_SECONDS,
};

// Constellation 2's Hydro RES cut, which each bubble and wave gives the enemy it strikes
const getConstellation2Status = ({ constellationCount }: Combatant): EnemyStatus | undefined =>
  constellationCount >= CONSTELLATION_2 ? CONSTELLATION_2_STATUS : undefined;

// Constellation 2's Bubbly Shield, cast as the press or the burst starts, for the action's seconds
const castBubblyShield = (context: KitContext, combatant: Combatant, seconds: number): void => {
  if (combatant.constellationCount < CONSTELLATION_2) return;
  const { characterIdCombatantMap, kitEffectState, party } = context;
  const maxHealth = getKitMaxHealth(combatant, kitEffectState.effects, party, characterIdCombatantMap);
  castKitShield(context, combatant.characterId, {
    element: Element.Hydro,
    health: CONSTELLATION_2_SHIELD_MAX_HEALTH_SHARE * maxHealth,
    secondsRemaining: seconds,
  });
};

// Sigewinne's behaviour: the press casts Bolstering Bubblebalm where she stands, its bubble's bounces landing from
// There, each a share of her Max HP as the striker's is when priced, and from Ascension 1 the press also gives her
// The Hydro DMG Bonus of Semi-Strict Bedrest. Constellation 2's Hydro RES cut and Bubbly Shield are built on the press and
// The burst. Its healing, its hold's bubble tiers and the Fully-Charged Aimed Shot's second level, the Mini-Stration
// Bubble, are not built
// Ascension 1's Convalescence stacks, which add to the Elemental Skill DMG of her off-field members, need a flat bonus
// On those members' skill hits, which no kit reaches, so they are not built
// Ascension 4 raises the healing she performs, which the kit does not build, and a heal reads the healed
// HealingBonus rather than its healer's, so no hook raises her own heals
// Constellation 1 needs three extra bounces of Bolstering Bubblebalm and the shrink rule, which the kit does not build
// Constellation 4 needs Super Saturated Syringing, the burst, which the kit does not build
// Constellation 6 needs the CRIT Rate and CRIT DMG her bubbles' heals set off, which the kit does not build
export const createSigewinneKitBehaviour = ({ kit, readHits }: KitRecordReader): KitBehaviour => {
  const bolsteringBubblebalmHits = readHits("bolsteringBubblebalmBounces", { enemyStatus: getConstellation2Status });
  return {
    burst: {
      hits: kit.elementalBurst.hits.map(() => ({ enemyStatus: getConstellation2Status })),
      onStart: (context) => {
        castBubblyShield(context, context.activeCombatant, kit.elementalBurst.seconds);
      },
    },
    skill: {
      onStart: (context) => {
        const { activeCombatant: combatant, body, kitEffectState } = context;
        castKitSummon(kitEffectState, body, combatant, bolsteringBubblebalmHits, {
          attackTag: AttackTag.ElementalSkill,
        });
        castBubblyShield(context, combatant, kit.elementalSkill.seconds);
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
