import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { createAheadBody } from "#src/services/kit/createAheadBody";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";

// Measured: gcsim v2.47.2 (MIT) dori/burst.go, the Connector's ticks each reaching the enemies in a circle of radius 10
// Five metres ahead of the body. The ticks run to the last past the table's 12 seconds, as gcsim runs them
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/dori/burst.go
const CONNECTOR_FIELD_RADIUS = 10;
const CONNECTOR_AHEAD_METRES = 5;

export const DORI_CHARACTER_ID = 10_000_068;

// Dori's behaviour: Alcazarzaray's Exactitude casts the Connector's field ahead of her, each of whose ticks strikes as a
// Summon from where it was cast. Her healing, energy regeneration, self-infusion and passives are not built: the healing
// And energy wait on a field that heals on its own clock, and the self-infusion and the passives wait on hooks the kit
// Does not yet offer
// Constellation 1 needs the Troubleshooter Shots' After-Sales Service Rounds, which the kit does not build
// Constellation 2 needs the Jinni's healing and its Toop shot, which wait on the Jinni's own clock to heal
// Constellation 4 needs the buffs on the Jinni's connected member by its HP and Energy, which wait on the same healing
// Constellation 6 needs Spirit-Warding Lamp's Electro infusion and Troubleshooter Cannon's shots, which are not built
export const createDoriKitBehaviour = ({ readHit, readSeconds }: KitRecordReader): KitBehaviour => {
  const connector = readHit("connector");
  const connectorFirstTickSeconds = readSeconds("connectorFirstTick");
  const connectorTickIntervalSeconds = readSeconds("connectorTickInterval");
  const connectorSeconds = readSeconds("connector");
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        // The connector ticks in the circle five metres ahead of the body, where the burst was cast, and each tick strikes
        // From that spot whatever the body does after
        const spot = createAheadBody(body, CONNECTOR_AHEAD_METRES);
        castKitField(kitEffectState, combatant.characterId, spot.position, {
          nextTickSeconds: connectorFirstTickSeconds,
          onTick: ({ kitEffectState: tickEffectState }) => {
            castKitSummon(tickEffectState, spot, combatant, [connector]);
          },
          radius: CONNECTOR_FIELD_RADIUS,
          secondsRemaining: connectorSeconds,
          tickIntervalSeconds: connectorTickIntervalSeconds,
        });
      },
    },
  };
};
