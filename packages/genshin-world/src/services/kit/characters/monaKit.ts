import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { takeOne } from "@esposter/shared";

// The Omen Stellaris Phantasm's bubble leaves on the enemy it held as it bursts, as the wiki's Stellaris Phantasm page
// Gives it
// https://genshin-impact.fandom.com/wiki/Stellaris_Phantasm
const OMEN_STATUS_ID = "mona-omen";
// Measured: gcsim v2.47.2 (MIT) mona/asc.go, Ascension 1's phantom for every 2 seconds of sprint, lasting 2 seconds and
// Exploding at its end for half of Mirror Reflection's explosion
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/mona/asc.go
const A1_PHANTOM_SECONDS = 2;
// Measured: gcsim v2.47.2 (MIT) mona/asc.go, Ascension 4 adds 20% of Mona's Energy Recharge to her Hydro DMG Bonus
const A4_HYDRO_BONUS_OF_ENERGY_RECHARGE = 0.2;
// Constellation 2: the last hit of a normal attack has a 20% chance to be followed by her Charged Attack's hit, which can
// Happen once every 5 seconds, as gcsim v2.47.2 (MIT) mona/cons.go gives it. The follow-up lands with that hit, as an
// Extra hit of a normal attack does
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/mona/cons.go
const CONSTELLATION_2 = 2;
const FOLLOW_UP_CHANCE = 0.2;
const FOLLOW_UP_COOLDOWN_SECONDS = 5;
const FOLLOW_UP_STATUS_ID = "mona-constellation-2";

// Ascension 4's Hydro DMG Bonus, which a hit reads as it is priced, from 20% of Mona's Energy Recharge
const getPassiveBonuses = (combatant: Combatant): { amount: number; attribute: Attribute }[] =>
  combatant.ascension < 4
    ? []
    : [
        {
          amount: A4_HYDRO_BONUS_OF_ENERGY_RECHARGE * combatant.attributes.attributeTotalMap[Attribute.EnergyRecharge],
          attribute: Attribute.HydroDamageBonus,
        },
      ];

export const MONA_CHARACTER_ID = 10_000_041;

// Mona's behaviour: Mirror Reflection of Doom casts its phantom where she stands, ticking and then exploding, and
// Stellaris Phantasm holds each enemy its cast strikes in its bubble, whose burst leaves the Omen. From Ascension 1 every
// 2 seconds of sprint casts a phantom that explodes as it ends, and from Ascension 4 her Energy Recharge raises her Hydro
// DMG Bonus
// Constellation 1 needs reaction DMG and Frozen duration bonuses for the party, which no hook carries
// Constellation 4 needs a CRIT Rate bonus on every member's strikes against Omen, which only the striker's kit reaches
// Constellation 6 needs the sprint-based Charged Attack bonus, which a strike hook cannot read without kit state
export const createMonaKitBehaviour = ({ kit, readHits }: KitRecordReader): KitBehaviour => {
  const mirrorReflectionHits = readHits("mirrorReflectionPhantom");
  const sprintPhantomHits = readHits("sprintPhantom");
  return {
    burst: { hits: [{ bubbleOmenId: OMEN_STATUS_ID }] },
    // Constellation 2: the last hit of a normal attack may be followed by her Charged Attack's hit, once every 5 seconds
    getNormalAttackExtraHit: ({ activeCombatant, kitEffectState, random }, hit, chainIndex) => {
      const { characterId, constellationCount } = activeCombatant;
      if (
        constellationCount < CONSTELLATION_2 ||
        hit !== kit.normalAttacks[chainIndex]?.hits.at(-1) ||
        checkIsKitStatusActive(kitEffectState.effects, characterId, FOLLOW_UP_STATUS_ID) ||
        random() >= FOLLOW_UP_CHANCE
      )
        return undefined;
      addKitStatus(kitEffectState, characterId, {
        id: FOLLOW_UP_STATUS_ID,
        secondsRemaining: FOLLOW_UP_COOLDOWN_SECONDS,
      });
      return { ...takeOne(kit.chargedAttack.hits), hitmarkSeconds: hit.hitmarkSeconds };
    },
    getPassiveBonuses,
    // Ascension 1: a phantom for every 2 seconds of sprint, which the kit spends from the sprint's seconds as it goes,
    // Lasting until its explosion
    onSprint: ({ activeCombatant: combatant, body, kitEffectState }, kitState) => {
      if (combatant.ascension < 1 || kitState.sprintSeconds < A1_PHANTOM_SECONDS) return;
      kitState.sprintSeconds -= A1_PHANTOM_SECONDS;
      castKitSummon(kitEffectState, body, combatant, sprintPhantomHits);
    },
    // The phantom is cast where Mona stands, its hits the summon's, and lasts until its explosion
    skill: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        castKitSummon(kitEffectState, body, combatant, mirrorReflectionHits),
    },
  };
};
