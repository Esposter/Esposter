import type { World } from "#shared/models/dungeons/data/world/World";

import { WorldData } from "#shared/models/dungeons/data/world/WorldData";
import { TilemapKeys } from "#shared/models/dungeons/keys/TilemapKey";

export const getInitialWorld = (): World =>
  Object.fromEntries(TilemapKeys.map((tilemapKey) => [tilemapKey, new WorldData()]));
