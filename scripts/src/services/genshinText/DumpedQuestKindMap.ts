import { DumpedQuestKind } from "#src/models/genshinText/DumpedQuestKind";
import { QuestKind } from "genshin-world";

// Each quest type's code in the dump's quest table: Archon, legend (a story quest), world, event and the daily
// Commissions' own
export const DumpedQuestKindMap: Readonly<Record<string, QuestKind>> = {
  [DumpedQuestKind.ArchonQuest]: QuestKind.Archon,
  [DumpedQuestKind.CommissionQuest]: QuestKind.Commission,
  [DumpedQuestKind.EventQuest]: QuestKind.Event,
  [DumpedQuestKind.StoryQuest]: QuestKind.Story,
  [DumpedQuestKind.WorldQuest]: QuestKind.World,
};
