import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { Party } from "#src/models/party/Party";

import { Attribute } from "#src/models/character/Attribute";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
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

export const ROSARIA_CHARACTER_ID = 10_000_045;

// Rosaria's behaviour: Rites of Termination places a field where she casts it, ticking from the lance on, each tick a
// Summon cast where the lance landed, for the table's seconds, longer from Constellation 2. Ascension 4's Crit Rate share
// Is built on the cast. From Ascension 1 Ravaging Confession's first hit gives her CRIT Rate, as gcsim has the hit land from
// behind, as the kit does too, since her teleport, which decides whether a hit lands from behind, is not built. Her other
// Constellations are not built:
// Constellation 1 needs CRIT hits as an event and an ATK SPD bonus, which the kit does not carry
// Constellation 4 needs Ravaging Confession's CRIT hits as an event, which the kit does not emit
// Constellation 6 needs a Physical RES cut, which EnemyStatus cannot key, as Element has no Physical
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

export const createRosariaKitBehaviour = ({ kit, readHit, readParameter }: KitRecordReader): KitBehaviour => {
  const ritesLanceHit = takeOne(kit.elementalBurst.hits, 1);
  const ritesTickHit = readHit("ritesTick");
  const ritesFieldSeconds = readParameter("ritesOfTerminationSeconds");
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body: { facing, height, position }, kitEffectState, party }) => {
        const field = castKitField(kitEffectState, combatant.characterId, position, {
          id: RITES_FIELD_ID,
          nextTickSeconds: ritesLanceHit.hitmarkSeconds + RITES_TICK_INTERVAL_SECONDS,
          onTick: ({ kitEffectState: tickEffectState }) =>
            castKitSummon(tickEffectState, { facing, height, position: field.centre }, combatant, [ritesTickHit]),
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
    },
  };
};
