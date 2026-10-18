import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
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
// Constellation 6, Illusory Torrent: each second of sprint gives her next Charged Attack 60% more DMG, up to three seconds, for
// Eight seconds from the last stack, and the Charged Attack that strikes resets them, as gcsim v2.47.2 (MIT) mona/cons.go
// Gives them. The sprint's second is kept on a clock status a sprint's first step starts, and the sprint on a status that
// Runs out a moment after the sprint ends
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/mona/cons.go
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_BONUS_PER_STACK = 0.6;
const CONSTELLATION_6_MAX_STACKS = 3;
const CONSTELLATION_6_CLOCK_SECONDS = 1;
const CONSTELLATION_6_BUFF_SECONDS = 8;
const CONSTELLATION_6_SPRINT_GRACE_SECONDS = 0.1;
const CONSTELLATION_6_CLOCK_STATUS_ID = "mona-constellation-6-clock";
const CONSTELLATION_6_SPRINT_STATUS_ID = "mona-constellation-6-sprinting";
const CONSTELLATION_6_BUFF_STATUS_ID = "mona-constellation-6-buff";

// Constellation 6's stacks, which the buff holds while it runs
const getConstellation6Stacks = (effects: readonly KitEffect[], characterId: number): number =>
  checkIsKitStatusActive(effects, characterId, CONSTELLATION_6_BUFF_STATUS_ID)
    ? (findKitStatus(effects, characterId, CONSTELLATION_6_BUFF_STATUS_ID)?.stacks ?? 0)
    : 0;

// Constellation 6, run each step she sprints on the field: a sprint's first step starts the clock, and each second the clock
// Runs out while she still sprints adds a stack, which refreshes the buff's eight seconds
const stepConstellation6Sprint = ({ activeCombatant: combatant, kitEffectState }: KitContext): void => {
  const { characterId } = combatant;
  const { effects } = kitEffectState;
  const isSprinting = checkIsKitStatusActive(effects, characterId, CONSTELLATION_6_SPRINT_STATUS_ID);
  addKitStatus(kitEffectState, characterId, {
    id: CONSTELLATION_6_SPRINT_STATUS_ID,
    secondsRemaining: CONSTELLATION_6_SPRINT_GRACE_SECONDS,
  });
  if (!isSprinting) {
    addKitStatus(kitEffectState, characterId, {
      id: CONSTELLATION_6_CLOCK_STATUS_ID,
      secondsRemaining: CONSTELLATION_6_CLOCK_SECONDS,
    });
    return;
  }
  if (checkIsKitStatusActive(effects, characterId, CONSTELLATION_6_CLOCK_STATUS_ID)) return;
  addKitStatus(kitEffectState, characterId, {
    id: CONSTELLATION_6_BUFF_STATUS_ID,
    secondsRemaining: CONSTELLATION_6_BUFF_SECONDS,
    stacks: Math.min(CONSTELLATION_6_MAX_STACKS, getConstellation6Stacks(effects, characterId) + 1),
  });
  addKitStatus(kitEffectState, characterId, {
    id: CONSTELLATION_6_CLOCK_STATUS_ID,
    secondsRemaining: CONSTELLATION_6_CLOCK_SECONDS,
  });
};

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
    // Constellation 6: her Charged Attack's damage grows with her sprint's stacks, and the attack that strikes resets them
    chargedAttack: {
      hits: kit.chargedAttack.hits.map((_hit, index, hits) =>
        index === hits.length - 1
          ? {
              onStrike: ({ activeCombatant: combatant, kitEffectState }) => {
                if (combatant.constellationCount < CONSTELLATION_6) return;
                addKitStatus(kitEffectState, combatant.characterId, {
                  id: CONSTELLATION_6_BUFF_STATUS_ID,
                  secondsRemaining: 0,
                  stacks: 0,
                });
              },
            }
          : {},
      ),
    },
    getPassiveBonuses,
    getStrikeDamageBonus: ({ attackTag, combatant }, _enemy, _party, effects = []) =>
      combatant.constellationCount >= CONSTELLATION_6 && attackTag === AttackTag.ChargedAttack
        ? CONSTELLATION_6_BONUS_PER_STACK * getConstellation6Stacks(effects, combatant.characterId)
        : 0,
    // Ascension 1: a phantom for every 2 seconds of sprint, which the kit spends from the sprint's seconds as it goes,
    // Lasting until its explosion
    onSprint: (context, kitState) => {
      const { activeCombatant: combatant, body, kitEffectState } = context;
      if (combatant.constellationCount >= CONSTELLATION_6) stepConstellation6Sprint(context);
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
