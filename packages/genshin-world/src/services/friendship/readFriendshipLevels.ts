import type { FriendshipLevel } from "#src/models/friendship/FriendshipLevel";

import { friendshipLevelSchema } from "#src/models/friendship/FriendshipLevel";
import { z } from "zod";

// The friendship levels, read from the friendship slice `pnpm -C scripts genshin:assets friendship` writes, imported on
// Demand as a chunk of its own and checked against their shape as it arrives
export const readFriendshipLevels = async (): Promise<FriendshipLevel[]> => {
  const { default: friendship } = await import("#src/generated/friendship/friendship.json");
  return z.array(friendshipLevelSchema).parse(friendship.levels);
};
