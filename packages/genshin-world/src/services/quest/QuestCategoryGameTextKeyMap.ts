import { QuestCategory } from "#src/models/quest/QuestCategory";
import { GameTextKey } from "genshin-text";

export const QuestCategoryGameTextKeyMap = {
  [QuestCategory.Archon]: GameTextKey.QuestCategoryArchon,
  [QuestCategory.Commission]: GameTextKey.QuestCategoryCommission,
  [QuestCategory.Story]: GameTextKey.QuestCategoryStory,
  [QuestCategory.World]: GameTextKey.QuestCategoryWorld,
} as const satisfies Record<QuestCategory, GameTextKey>;
