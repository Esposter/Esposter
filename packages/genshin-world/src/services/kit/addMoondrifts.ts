import type { Reaction } from "#src/models/combat/Reaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Party } from "#src/models/party/Party";
import type { GroundPoint } from "genshin-engine";

import { ReactionType } from "#src/models/combat/ReactionType";
import { checkIsNearMoondrift } from "#src/services/party/checkIsNearMoondrift";
import {
  LUNAR_CRYSTALLIZE_MAXIMUM_COUNT,
  MOONDRIFT_HARMONY_COOLDOWN_SECONDS,
  MOONDRIFT_HARMONY_COUNT,
  MOONDRIFT_HARMONY_HIT_SECONDS,
  MOONDRIFT_OFFSETS,
  MOONDRIFT_SECONDS,
} from "#src/services/party/constants";

// The party's answer to each Lunar-Crystallize a combatant triggered on an enemy, written in place. It counts toward the
// Next Moondrift Harmony, and the combatant and the sources of the Hydro it consumed join the Harmony's contributors.
// While fewer than three Moondrifts stand near the character on the field, it leaves as many more as make three about
// The enemy. With three standing and three counted, out of the Harmony's cooldown, it spends the three to resonate one:
// Three hits on their way to the enemy from its contributors, who are then cleared, owned by the combatant, and the
// Moondrifts near kept standing their full seconds again
export const addMoondrifts = (
  { lunarCrystallize }: Party,
  enemy: Enemy,
  { characterId }: Combatant,
  reactions: readonly Reaction[],
  position: GroundPoint,
): void => {
  for (const { reactionType, sourceIds = [] } of reactions) {
    if (reactionType !== ReactionType.LunarCrystallize) continue;
    lunarCrystallize.count = Math.min(lunarCrystallize.count + 1, LUNAR_CRYSTALLIZE_MAXIMUM_COUNT);
    for (const contributorId of [characterId, ...sourceIds]) lunarCrystallize.contributorIds.add(contributorId);
    const nearbyMoondrifts = lunarCrystallize.moondrifts.filter((moondrift) =>
      checkIsNearMoondrift(moondrift, position),
    );
    if (nearbyMoondrifts.length < MOONDRIFT_OFFSETS.length)
      for (const offset of MOONDRIFT_OFFSETS.slice(0, MOONDRIFT_OFFSETS.length - nearbyMoondrifts.length))
        lunarCrystallize.moondrifts.push({
          position: { x: enemy.position.x + offset.x, z: enemy.position.z + offset.z },
          secondsRemaining: MOONDRIFT_SECONDS,
        });
    else if (lunarCrystallize.count >= MOONDRIFT_HARMONY_COUNT && lunarCrystallize.harmonyCooldownSeconds <= 0) {
      lunarCrystallize.count -= MOONDRIFT_HARMONY_COUNT;
      lunarCrystallize.harmonyCooldownSeconds = MOONDRIFT_HARMONY_COOLDOWN_SECONDS;
      const contributorIds = new Set(lunarCrystallize.contributorIds);
      for (const secondsRemaining of MOONDRIFT_HARMONY_HIT_SECONDS)
        enemy.moondriftHarmonyHits.push({ contributorIds, ownerId: characterId, secondsRemaining });
      lunarCrystallize.contributorIds.clear();
      for (const moondrift of nearbyMoondrifts) moondrift.secondsRemaining = MOONDRIFT_SECONDS;
    }
  }
};
