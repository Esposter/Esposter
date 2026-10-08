import type { FriendshipLevel } from "#src/models/friendship/FriendshipLevel";

import { friendshipLevelSchema } from "#src/models/friendship/FriendshipLevel";
import { z } from "zod";

// The friendship levels, the slice `pnpm -C scripts genshin:assets friendship` writes, imported on demand as a chunk of
// Its own and checked against its shape as it arrives
export const readFriendshipLevels = async (): Promise<FriendshipLevel[]> => {
  const { default: friendshipLevels } = await import("#src/generated/friendship/levels.json");
  return z.array(friendshipLevelSchema).parse(friendshipLevels);
};
