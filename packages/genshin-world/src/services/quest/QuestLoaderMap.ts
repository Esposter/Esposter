import type { QuestId } from "#src/models/quest/QuestId";

import { QuestId as QuestIdValues } from "#src/models/quest/QuestId";

// Each carried quest's table, the slice `pnpm -C scripts genshin:text quests` writes, imported on demand as a chunk of its
// Own. Typed over every QuestId, so a quest carried without its loader does not typecheck
export const QuestLoaderMap: Record<QuestId, () => Promise<{ default: unknown }>> = {
  [QuestIdValues.BirdsEyeView]: () => import("#src/generated/quests/352.json"),
  [QuestIdValues.WanderersTrail]: () => import("#src/generated/quests/351.json"),
};
