import type { FriendshipLevels } from "#src/models/friendship/FriendshipLevels";

import { friendshipLevelSchema } from "#src/models/friendship/FriendshipLevel";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The friendship levels, read from the friendship slice `pnpm -C scripts genshin:assets friendship` writes, fetched by its
// Key from the hosted game data and checked against their shape as they arrive
export const readFriendshipLevels = async (gameDataBaseUrl: string): Promise<FriendshipLevels> => {
  const friendship = await readGameData(
    gameDataBaseUrl,
    "friendship/friendship",
    z.object({ levels: z.tuple([friendshipLevelSchema], friendshipLevelSchema) }),
  );
  return friendship.levels;
};
