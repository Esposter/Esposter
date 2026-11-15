export const DumpedQuestKind = {
  ArchonQuest: "AQ",
  CommissionQuest: "IQ",
  EventQuest: "EQ",
  StoryQuest: "LQ",
  WorldQuest: "WQ",
} as const;
export type DumpedQuestKind = (typeof DumpedQuestKind)[keyof typeof DumpedQuestKind];
