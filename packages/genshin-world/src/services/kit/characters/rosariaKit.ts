import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { Party } from "#src/models/party/Party";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { endKitStatus } from "#src/services/kit/effects/endKitStatus";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { takeOne } from "@esposter/shared";

// Measured: gcsim v2.47.2 (MIT) rosaria/burst.go, Rites of Termination's field ticks every 120 frames from 120 after the
// Lance, and Constellation 2 adds 240 frames to it. Provisional: gcsim's field lasts 510 frames, half a second past the
// Table's 8 seconds, which this adds to it as Diona's does
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/rosaria/burst.go
const RITES_TICK_INTERVAL_SECONDS = 2;
const RITES_FIELD_ID = "rosaria-rites-of-termination-field";
const RITES_FIELD_MARGIN_SECONDS = 0.5;
const RITES_CONSTELLATION = 2;
const RITES_CONSTELLATION_SECONDS = 4;
// Measured: gcsim v2.47.2 (MIT) rosaria/asc.go, Ascension 4 gives each other member of the team 15% of her own Crit Rate,
// At most 15%, for 600 frames from the cast
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/rosaria/asc.go
const ASCENSION_4 = 4;
const ASCENSION_4_CRIT_RATE_SHARE = 0.15;
const ASCENSION_4_CRIT_RATE_MAX = 0.15;
const ASCENSION_4_SECONDS = 10;

// Regina Probationum, as the dump's Rosaria_PermanentSkill_1 row (promote 1, params 0.12 and 5) and gcsim v2.47.2 (MIT)
// Rosaria/asc.go and skill.go give it: from Ascension 1, Ravaging Confession's first hit gives her 12% CRIT Rate for 5
// Seconds as it strikes an enemy. gcsim assumes the hit lands from behind, as the kit does without her teleport
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/rosaria/asc.go
const REGINA_PROBATIONUM_ASCENSION = 1;
const REGINA_PROBATIONUM_CRITICAL_RATE = 0.12;
const REGINA_PROBATIONUM_SECONDS = 5;
const REGINA_PROBATIONUM_SOURCE = "rosaria-regina-probationum";

// Constellation 1, as gcsim v2.47.2 (MIT) rosaria/cons.go gives it: a CRIT hit of hers on the field gives her 10% Normal
// ATK SPD and 10% Normal Attack DMG for 4 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/rosaria/cons.go
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_ATTACK_SPEED_BONUS = 0.1;
const CONSTELLATION_1_DAMAGE_BONUS = 0.1;
const CONSTELLATION_1_SECONDS = 4;
const CONSTELLATION_1_STATUS_ID = "rosaria-constellation-1";
// Constellation 4, cons.go: a CRIT hit of Ravaging Confession on the field regenerates 5 Energy for her, once each cast
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_ENERGY = 5;
const CONSTELLATION_4_STATUS_ID = "rosaria-constellation-4";
// Constellation 6, cons.go: Rites of Termination's attacks lower each enemy's Physical RES by 20% for 10 seconds
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_PHYSICAL_RESISTANCE_REDUCTION = 0.2;
const CONSTELLATION_6_SECONDS = 10;
const CONSTELLATION_6_STATUS: EnemyStatus = {
  damageTakenBonus: 0,
  id: "rosaria-constellation-6",
  physicalResistanceReduction: CONSTELLATION_6_PHYSICAL_RESISTANCE_REDUCTION,
  secondsRemaining: CONSTELLATION_6_SECONDS,
};

export const ROSARIA_CHARACTER_ID = 10_000_045;

// Rosaria's behaviour: Rites of Termination places a field where she casts it, ticking from the lance on, each tick a
// Summon cast where the lance landed, for the table's seconds, longer from Constellation 2. Ascension 4's Crit Rate share
// Is built on the cast. From Ascension 1 Ravaging Confession's first hit gives her CRIT Rate, as gcsim has the hit land from behind.
// The kit does too, since her teleport, which decides whether a hit lands from behind, is not built. Her Constellations 1,
// 4 and 6 are built on the kit's own CRIT events, its skill's status and the enemies' Physical RES
// Ascension 4: the cast's Crit Rate for every other member of the deployed team, from her own Crit Rate as it stands
const addAscension4CritRate = (combatant: Combatant, kitEffectState: KitEffectState, party: Party): void => {
  const amount = Math.min(
    ASCENSION_4_CRIT_RATE_MAX,
    ASCENSION_4_CRIT_RATE_SHARE * combatant.attributes.attributeTotalMap[Attribute.CriticalRate],
  );
  for (const characterId of getDeployedCharacterIds(party))
    if (characterId !== combatant.characterId)
      buffKitMember(kitEffectState, characterId, {
        amount,
        attribute: Attribute.CriticalRate,
        secondsRemaining: ASCENSION_4_SECONDS,
      });
};

// Constellation 6's Physical RES cut, which each of the burst's attacks gives the enemy it strikes
const getConstellation6Status = ({ constellationCount }: Combatant): EnemyStatus | undefined =>
  constellationCount >= CONSTELLATION_6 ? CONSTELLATION_6_STATUS : undefined;

export const createRosariaKitBehaviour = ({ kit, readHit, readParameter }: KitRecordReader): KitBehaviour => {
  const ritesLanceHit = takeOne(kit.elementalBurst.hits, 1);
  const ritesTickHit = { ...readHit("ritesTick"), enemyStatus: getConstellation6Status };
  const ritesFieldSeconds = readParameter("ritesOfTerminationSeconds");
  const ravagingConfessionSecondHit = takeOne(kit.elementalSkill.hits, 1);
  return {
    burst: {
      hits: [{ enemyStatus: getConstellation6Status }, { enemyStatus: getConstellation6Status }],
      onStart: ({ activeCombatant: combatant, body: { facing, height, position }, kitEffectState, party }) => {
        const field = castKitField(kitEffectState, combatant.characterId, position, {
          id: RITES_FIELD_ID,
          nextTickSeconds: ritesLanceHit.hitmarkSeconds + RITES_TICK_INTERVAL_SECONDS,
          onTick: ({ kitEffectState: tickEffectState }) => {
            castKitSummon(tickEffectState, { facing, height, position: field.centre }, combatant, [ritesTickHit], {
              attackTag: AttackTag.ElementalBurst,
            });
          },
          radius: ritesTickHit.hitArea.radius,
          secondsRemaining:
            ritesFieldSeconds +
            RITES_FIELD_MARGIN_SECONDS +
            (combatant.constellationCount >= RITES_CONSTELLATION ? RITES_CONSTELLATION_SECONDS : 0),
          tickIntervalSeconds: RITES_TICK_INTERVAL_SECONDS,
        });
        if (combatant.ascension >= ASCENSION_4) addAscension4CritRate(combatant, kitEffectState, party);
      },
    },
    // Constellation 1's Normal Attack DMG and ATK SPD while its status stands
    getNormalAttackSpeedBonus: ({ kitEffectState }) =>
      checkIsKitStatusActive(kitEffectState.effects, ROSARIA_CHARACTER_ID, CONSTELLATION_1_STATUS_ID)
        ? CONSTELLATION_1_ATTACK_SPEED_BONUS
        : 0,
    getStrikeDamageBonus: (strike, _enemy, _party, effects) =>
      strike.attackTag === AttackTag.NormalAttack &&
      checkIsKitStatusActive(effects, ROSARIA_CHARACTER_ID, CONSTELLATION_1_STATUS_ID)
        ? CONSTELLATION_1_DAMAGE_BONUS
        : 0,
    // A CRIT hit of hers on the field starts Constellation 1's status and, from Ravaging Confession while Constellation 4's
    // Status stands, gives her its Energy once
    onKitEvent: (event, { activeCombatant, kitEffectState, party }, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        !event.isCritical ||
        event.striker.characterId !== combatant.characterId ||
        activeCombatant.characterId !== combatant.characterId
      )
        return;
      if (combatant.constellationCount >= CONSTELLATION_1)
        addKitStatus(kitEffectState, combatant.characterId, {
          id: CONSTELLATION_1_STATUS_ID,
          secondsRemaining: CONSTELLATION_1_SECONDS,
        });
      if (
        combatant.constellationCount >= CONSTELLATION_4 &&
        event.attackTag === AttackTag.ElementalSkill &&
        checkIsKitStatusActive(kitEffectState.effects, combatant.characterId, CONSTELLATION_4_STATUS_ID)
      ) {
        endKitStatus(kitEffectState, combatant.characterId, CONSTELLATION_4_STATUS_ID);
        gainPartyMemberEnergy(party, combatant, CONSTELLATION_4_ENERGY);
      }
    },
    skill: {
      hits: [
        {
          // Each enemy the first hit strikes restarts the same CRIT Rate at the same moment, as gcsim gives it once
          onStrike: ({ kitEffectState }, { combatant }) => {
            if (combatant.ascension < REGINA_PROBATIONUM_ASCENSION) return;
            buffKitMember(kitEffectState, combatant.characterId, {
              amount: REGINA_PROBATIONUM_CRITICAL_RATE,
              attribute: Attribute.CriticalRate,
              secondsRemaining: REGINA_PROBATIONUM_SECONDS,
              source: REGINA_PROBATIONUM_SOURCE,
            });
          },
        },
      ],
      // Constellation 4's status is armed as each cast starts, and lasts through the skill's second hit, so the first CRIT
      // Hit of the cast gives its Energy and no later one does
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        if (combatant.constellationCount >= CONSTELLATION_4)
          addKitStatus(kitEffectState, combatant.characterId, {
            id: CONSTELLATION_4_STATUS_ID,
            secondsRemaining: ravagingConfessionSecondHit.hitmarkSeconds + FIXED_STEP_SECONDS,
          });
      },
    },
  };
};
