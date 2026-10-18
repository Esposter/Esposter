import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { SUMMON_LINGER_SECONDS } from "#src/services/kit/constants";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";

// Measured: gcsim (MIT, main) faruzan/burst.go, the three gadgets' places, offset from the body at the cast as gcsim's
// CalcOffsetPoint places them: the top right, the top left, then the bottom middle, cycled through by each Pulse
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/faruzan/burst.go
const WHIRLWIND_GADGET_OFFSETS: readonly { forward: number; lateral: number }[] = [
  { forward: 10.5, lateral: 5.19 },
  { forward: 10.5, lateral: -5.19 },
  { forward: 1.5, lateral: 0 },
];

// Measured: gcsim (MIT, main) faruzan/burst.go, Prayerful Wind's Gift's Anemo DMG Bonus, refreshed by each Pulse and given
// At the cast too
const PRAYERFUL_WIND_SOURCE = "faruzan-prayerful-wind";

// The Wind's Secret Ways' Perfidious Wind's Ruin, which the initial hit and each Whirlwind Pulse give the enemies they reach
const PERFIDIOUS_WIND_RUIN_ID = "faruzan-perfidious-wind-ruin";

export const FARUZAN_CHARACTER_ID = 10_000_076;

// A body the given metres ahead of another at its facing, and the given metres across it, as gcsim's offsets place a point:
// Forward runs along the facing's bearing, and across it lies the bearing a quarter turn to the right of that
const createOffsetBody = (
  { facing, height, position }: KitBody,
  { forward, lateral }: { forward: number; lateral: number },
): KitBody => ({
  facing,
  height,
  position: {
    x: position.x - Math.sin(facing) * forward + Math.cos(facing) * lateral,
    z: position.z - Math.cos(facing) * forward - Math.sin(facing) * lateral,
  },
});

// Faruzan's behaviour: The Wind's Secret Ways' initial hit shreds the enemies it reaches, and its cast places the Dazzling
// Polyhedron, whose Whirlwind Pulses shred each enemy they reach and give the party Prayerful Wind's Anemo DMG Bonus. The
// Manifest Gale and Pressurized Collapse, her partial aimed shot, her particles, her passive, and
// Constellations 1, 4 and 6 are not built. Constellation 2's longer polyhedron is built.
// Constellation 1 needs the Manifest Gale's Hurricane Arrows and Pressurized Collapse, which are not built
// Constellation 4 needs Pressurized Collapse's vortex, which restores energy by the opponents it hits, not built
// Constellation 6 needs Pressurized Collapse and the Prayerful Wind's Benefit CRIT DMG, which are not built
export const createFaruzanKitBehaviour = ({ readHit, readParameter, readSeconds }: KitRecordReader): KitBehaviour => {
  const perfidiousWindRuinResistanceReduction = readParameter("perfidiousWindRuinResistanceReduction");
  const perfidiousWindRuinSeconds = readParameter("perfidiousWindRuinSeconds");
  const prayerfulWindAnemoDamageBonus = readParameter("prayerfulWindAnemoDamageBonus");
  const prayerfulWindSeconds = readParameter("prayerfulWindSeconds");
  const firstWhirlwindPulseSeconds = readSeconds("firstWhirlwindPulse");
  const dazzlingPolyhedronSeconds = readSeconds("dazzlingPolyhedron");
  const whirlwindPulseIntervalSeconds = readSeconds("whirlwindPulseInterval");
  // The shred a Whirlwind Pulse and the initial hit give an enemy, its Anemo RES cut by the table's share for its seconds
  const createPerfidiousWindRuin = (): EnemyStatus => ({
    damageTakenBonus: 0,
    id: PERFIDIOUS_WIND_RUIN_ID,
    resistanceReduction: { [Element.Anemo]: perfidiousWindRuinResistanceReduction },
    secondsRemaining: perfidiousWindRuinSeconds,
  });
  // A Whirlwind Pulse is a hit of no damage cast from its gadget's place, which shreds each enemy within its reach
  const whirlwindPulse = readHit("whirlwindPulse", { enemyStatus: createPerfidiousWindRuin });
  // Prayerful Wind's Gift gives every member of the deployed team the Anemo DMG Bonus for its seconds
  const prayerfulWindsGift = {
    amount: prayerfulWindAnemoDamageBonus,
    attribute: Attribute.AnemoDamageBonus,
    secondsRemaining: prayerfulWindSeconds,
    source: PRAYERFUL_WIND_SOURCE,
  };
  // Constellation 2, Overzealous Intellect: the Dazzling Polyhedron lasts this many seconds longer
  const CONSTELLATION_2_EXTRA_POLYHEDRON_SECONDS = 6;

  // The Dazzling Polyhedron's field is placed where the burst is cast, and its gadgets are placed from that cast's body. Its
  // Ticks are the Whirlwind Pulses, each cast from the gadget its count cycles to, and it lingers past its seconds
  const castDazzlingPolyhedron = (kitEffectState: KitEffectState, castBody: KitBody, combatant: Combatant): void => {
    castKitField(kitEffectState, combatant.characterId, castBody.position, {
      nextTickSeconds: firstWhirlwindPulseSeconds,
      onTick: ({ kitEffectState: tickKitEffectState, party }, tickIndex) => {
        buffKitTeam(tickKitEffectState, party, prayerfulWindsGift);
        const gadgetOffset = WHIRLWIND_GADGET_OFFSETS[tickIndex % WHIRLWIND_GADGET_OFFSETS.length];
        if (gadgetOffset)
          castKitSummon(tickKitEffectState, createOffsetBody(castBody, gadgetOffset), combatant, [whirlwindPulse]);
      },
      secondsRemaining:
        dazzlingPolyhedronSeconds +
        SUMMON_LINGER_SECONDS +
        (combatant.constellationCount >= 2 ? CONSTELLATION_2_EXTRA_POLYHEDRON_SECONDS : 0),
      tickIntervalSeconds: whirlwindPulseIntervalSeconds,
    });
  };
  return {
    burst: {
      hits: [{ enemyStatus: createPerfidiousWindRuin }],
      onStart: ({ activeCombatant: combatant, body, kitEffectState, party }) => {
        castDazzlingPolyhedron(kitEffectState, body, combatant);
        buffKitTeam(kitEffectState, party, prayerfulWindsGift);
      },
    },
  };
};
