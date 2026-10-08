import { QuestKind } from "genshin-world";

// Each quest type's code in the dump's quest table: Archon, legend (a story quest), world, event and the daily
// Commissions' own
export const DumpedQuestKindMap: Readonly<Record<string, QuestKind>> = {
  AQ: QuestKind.Archon,
  EQ: QuestKind.Event,
  IQ: QuestKind.Commission,
  LQ: QuestKind.Story,
  WQ: QuestKind.World,
};
