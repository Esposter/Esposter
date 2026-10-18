import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
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

export const ROSARIA_CHARACTER_ID = 10_000_045;

// Rosaria's behaviour: Rites of Termination places a field where she casts it, ticking from the lance on, each tick a
// Summon cast where the lance landed, for the table's seconds, longer from Constellation 2. Her passives, her
// Constellations other than 2, and her teleport behind the target are not built, as the kit events and the body do not
// Reach them
// Constellation 1 needs CRIT hits as an event and an ATK SPD bonus, which the kit does not carry
// Constellation 4 needs Ravaging Confession's CRIT hits as an event, which the kit does not emit
// Constellation 6 needs a Physical RES cut, which EnemyStatus cannot key, as Element has no Physical
export const createRosariaKitBehaviour = ({ kit, readHit, readParameter }: KitRecordReader): KitBehaviour => {
  const ritesLanceHit = takeOne(kit.elementalBurst.hits, 1);
  const ritesTickHit = readHit("ritesTick");
  const ritesFieldSeconds = readParameter("ritesOfTerminationSeconds");
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body: { facing, height, position }, kitEffectState }) => {
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
      },
    },
  };
};
