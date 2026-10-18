import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AttackTag } from "#src/models/combat/AttackTag";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { selectNearestEnemy } from "#src/services/kit/selectNearestEnemy";

export const PRUNE_CHARACTER_ID = 10_000_132;

// The metres from Prune within which the Witchlure Bell's detection area finds the enemy its DoT ticks on
const WITCHLURE_BELL_DETECTION_RADIUS = 10;

// Prune's behaviour: her burst's Witchlure Bell, a DoT that ticks while its status lasts on the enemy nearest her within
// Its detection area. Her skill's Clang Clang convert state and her passives wait on their hooks
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/prune/burst.go
// Constellation 1 needs the Banehunter Oathhammer's Elemental Conversion, which the kit does not build
// Constellation 2 needs the Hunt the Witch ATK bonus in the Witchlure Bell's Hunter-Seeker mode, not built
// Constellation 4 needs the Elemental Conversion Oathhammer summons from the burst, which the kit does not build
// Constellation 6 needs the Witchlure Bell's Hunter-Seeker extension and the Tolling Rally reactions, not built
export const createPruneKitBehaviour = ({ readHit, readSeconds }: KitRecordReader): KitBehaviour => {
  const witchlureBellHit = readHit("witchlureBell");
  const burstFirstTickSeconds = readSeconds("burstFirstTick");
  const burstTickIntervalSeconds = readSeconds("burstTickInterval");
  const burstDurationSeconds = readSeconds("burstDuration");
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body: { facing, height, position }, kitEffectState }) => {
        // The bell follows Prune, so its detection area is where she stands on each tick, and each tick's DoT lands on the
        // Enemy the area finds, as it is priced then, and is none while no enemy stands in reach
        const bell = castKitField(kitEffectState, combatant.characterId, position, {
          isFollowing: true,
          nextTickSeconds: burstFirstTickSeconds,
          onTick: ({ enemyMap, kitEffectState: tickEffectState }) => {
            const target = selectNearestEnemy(bell.centre, enemyMap.values(), WITCHLURE_BELL_DETECTION_RADIUS);
            if (!target) return;
            // Each tick's DoT is a summon cast on the tick, so its hit lands on the tick's step, not at the record's first tick
            castKitSummon(
              tickEffectState,
              { facing, height, position: bell.centre },
              combatant,
              [{ ...witchlureBellHit, hitmarkSeconds: 0 }],
              { attackTag: AttackTag.ElementalBurst, target },
            );
          },
          secondsRemaining: burstDurationSeconds,
          tickIntervalSeconds: burstTickIntervalSeconds,
        });
      },
    },
  };
};
