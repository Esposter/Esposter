import { QuestCategory } from "#src/models/quest/QuestCategory";
import { QuestKind } from "#src/models/quest/QuestKind";

export const QuestKindCategoryMap = {
  [QuestKind.Archon]: QuestCategory.Archon,
  [QuestKind.Commission]: QuestCategory.Commission,
  [QuestKind.Event]: QuestCategory.World,
  [QuestKind.Story]: QuestCategory.Story,
  [QuestKind.World]: QuestCategory.World,
} as const satisfies Record<QuestKind, QuestCategory>;
