import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { createConstellationSkillChargeBonus } from "#src/services/kit/createConstellationSkillChargeBonus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { castKitTaunt } from "#src/services/kit/effects/castKitTaunt";
import { takeOne } from "@esposter/shared";

// Provisional: no source gives the lotus health, so it stands until its seconds run out, unless a taunt's health is taken
const ICE_LOTUS_HEALTH = Number.POSITIVE_INFINITY;

// Measured: gcsim v2.47.2 (MIT) ganyu/burst.go, Celestial Shower's field of radius 10 from the cast, each tick's hit landing
// On a random enemy in the field, or a random point in it when none is
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ganyu/burst.go
const CELESTIAL_SHOWER_RADIUS = 10;
// Measured: gcsim v2.47.2 (MIT) ganyu/burst.go, Harmony between Heaven and Earth's 20% Cryo DMG Bonus for the
// Active character inside the field for 60 frames, from Ascension 4
const HARMONY_ASCENSION = 4;
const HARMONY_CRYO_DAMAGE_BONUS = 0.2;
const HARMONY_SECONDS = 1;

// Measured: gcsim v2.47.2 (MIT) ganyu/aimed.go, Undivided Heart's 20% CRIT Rate for 300 frames on each later Frostflake
// Arrow, from Ascension 1, which the first arrow of a charge does not get, as the buff comes after its strike
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ganyu/aimed.go
const UNDIVIDED_HEART_ASCENSION = 1;
const UNDIVIDED_HEART_CRITICAL_RATE = 0.2;
const UNDIVIDED_HEART_SECONDS = 5;
const UNDIVIDED_HEART_SOURCE = "ganyu-undivided-heart";
const HARMONY_SOURCE = "ganyu-harmony";

// Measured: gcsim v2.47.2 (MIT) ganyu/cons.go, Frostflake Arrows and their Bloom reduce the enemy's Cryo RES by 15% for 300
// Frames from Constellation 1, which the wiki's text gives as 6 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ganyu/cons.go
const FROSTFLAKE_CONSTELLATION = 1;
const FROSTFLAKE_CRYO_RESISTANCE_REDUCTION = 0.15;
const FROSTFLAKE_STATUS: EnemyStatus = {
  damageTakenBonus: 0,
  id: "ganyu-frostflake",
  resistanceReduction: { [Element.Cryo]: FROSTFLAKE_CRYO_RESISTANCE_REDUCTION },
  secondsRemaining: 5,
};
const getFrostflakeStatus = ({ constellationCount }: Combatant): EnemyStatus | undefined =>
  constellationCount >= FROSTFLAKE_CONSTELLATION ? FROSTFLAKE_STATUS : undefined;

export const GANYU_CHARACTER_ID = 10_000_037;

// Ganyu's behaviour: the fully charged shot's Frostflake Arrow and its Bloom cut the enemy's Cryo RES from Constellation
// 1, and the arrow gives her Undivided Heart's CRIT Rate from Ascension 1. Ice Lotus casts its taunt where she stands,
// Exploding as its seconds from the flower's hit run out. Celestial Shower casts its field, whose ticks each strike from
// Where it was cast and give the active character Harmony between Heaven and Earth's Cryo DMG Bonus from Ascension 4
// Constellation 4 needs the increased DMG taken within Celestial Shower, which no enemy stack carries yet
// Constellation 6 needs the next fully charged Frostflake Arrow within 30 seconds to skip charging, not built
export const createGanyuKitBehaviour = ({
  kit,
  readHit,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const iceLotusFlowerHitmarkSeconds = takeOne(kit.elementalSkill.hits).hitmarkSeconds;
  const iceLotusExplosion = readHit("iceLotusExplosion");
  const iceLotusSeconds = readParameter("iceLotusSeconds");
  const celestialShowerHit = readHit("celestialShower");
  const celestialShowerSeconds = readParameter("celestialShowerSeconds");
  const celestialShowerStartSeconds = readSeconds("celestialShowerStart");
  const celestialShowerTickIntervalSeconds = readSeconds("celestialShowerTickInterval");
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body: { facing, height, position }, kitEffectState }) => {
        const field = castKitField(kitEffectState, combatant.characterId, position, {
          nextTickSeconds: celestialShowerStartSeconds,
          onTick: ({ activeCombatant, kitEffectState: tickEffectState }) => {
            if (combatant.ascension >= HARMONY_ASCENSION)
              buffKitMember(tickEffectState, activeCombatant.characterId, {
                amount: HARMONY_CRYO_DAMAGE_BONUS,
                attribute: Attribute.CryoDamageBonus,
                secondsRemaining: HARMONY_SECONDS,
                source: HARMONY_SOURCE,
              });
            castKitSummon(tickEffectState, { facing, height, position: field.centre }, combatant, [celestialShowerHit]);
          },
          radius: CELESTIAL_SHOWER_RADIUS,
          secondsRemaining: celestialShowerSeconds + celestialShowerStartSeconds + 0.1,
          tickIntervalSeconds: celestialShowerTickIntervalSeconds,
        });
      },
    },
    // The fully charged shot's Frostflake Arrow lands with its animation's end, and its Bloom after the arrow's travel,
    // Past the animation, as the shot's own hit queued past its end
    chargedAttack: {
      hits: [
        {
          enemyStatus: getFrostflakeStatus,
          onStrike: ({ kitEffectState }, { combatant }) => {
            if (combatant.ascension < UNDIVIDED_HEART_ASCENSION) return;
            buffKitMember(kitEffectState, combatant.characterId, {
              amount: UNDIVIDED_HEART_CRITICAL_RATE,
              attribute: Attribute.CriticalRate,
              secondsRemaining: UNDIVIDED_HEART_SECONDS,
              source: UNDIVIDED_HEART_SOURCE,
            });
          },
        },
        { enemyStatus: getFrostflakeStatus },
      ],
    },
    getSkillChargeBonus: createConstellationSkillChargeBonus(2),
    skill: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        castKitTaunt(kitEffectState, body, combatant, {
          explosion: iceLotusExplosion,
          health: ICE_LOTUS_HEALTH,
          secondsRemaining: iceLotusFlowerHitmarkSeconds + iceLotusSeconds,
        }),
    },
  };
};
