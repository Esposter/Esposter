import { QuestKind } from "genshin-world";
import { DumpedQuestKind } from "#src/models/genshinText/DumpedQuestKind";

// Each quest type's code in the dump's quest table: Archon, legend (a story quest), world, event and the daily
// Commissions' own
export const DumpedQuestKindMap: Readonly<Record<string, QuestKind>> = {
  [DumpedQuestKind.ArchonQuest]: QuestKind.Archon,
  [DumpedQuestKind.EventQuest]: QuestKind.Event,
  [DumpedQuestKind.CommissionQuest]: QuestKind.Commission,
  [DumpedQuestKind.StoryQuest]: QuestKind.Story,
  [DumpedQuestKind.WorldQuest]: QuestKind.World,
};
