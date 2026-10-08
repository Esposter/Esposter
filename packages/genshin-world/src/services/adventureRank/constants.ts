import type { AdventureRankLevel } from "#src/models/adventureRank/AdventureRankLevel";
import type { AdventureRankLock } from "#src/models/adventureRank/AdventureRankLock";
import type { WorldLevelRow } from "#src/models/adventureRank/WorldLevelRow";

import levelsJson from "#src/data/adventureRank/levels.json";
import locksJson from "#src/data/adventureRank/locks.json";
import worldLevelsJson from "#src/data/adventureRank/worldLevels.json";
import { adventureRankLevelSchema } from "#src/models/adventureRank/AdventureRankLevel";
import { adventureRankLockSchema } from "#src/models/adventureRank/AdventureRankLock";
import { worldLevelRowSchema } from "#src/models/adventureRank/WorldLevelRow";
import { z } from "zod";

// The game's rank table, lock table and world level table, read from the dump by `genshin:assets rank`
export const ADVENTURE_RANK_LEVELS: AdventureRankLevel[] = z.array(adventureRankLevelSchema).parse(levelsJson);
export const ADVENTURE_RANK_LOCKS: AdventureRankLock[] = z.array(adventureRankLockSchema).parse(locksJson);
export const WORLD_LEVEL_ROWS: WorldLevelRow[] = z.array(worldLevelRowSchema).parse(worldLevelsJson);
export const MAX_ADVENTURE_RANK = 60;
// Adventure EXP past the highest rank is paid in Mora at ten for each point
export const MORA_PER_EXCESS_ADVENTURE_EXP = 10;
// From this World Level the player may lower it by one
export const WORLD_LEVEL_LOWERING_MINIMUM = 3;
// Any change of the World Level, lowering or restoring it, waits this long after the last one
export const WORLD_LEVEL_ADJUSTMENT_COOLDOWN: Temporal.Duration = Temporal.Duration.from({ hours: 24 });
// Provisional: the level an enemy spawned at World Level 1 and up stands at, its World Level's monster level plus its
// Camp's level less this. The wiki's enemy level ranges put each World Level's lowest enemy 14 to 17 under its monster
// Level, which a camp at level 1 or 2 gives; the name plates of enemies at World Level 1, 5 and 9 measure it
export const SPAWN_LEVEL_REFERENCE = 18;
