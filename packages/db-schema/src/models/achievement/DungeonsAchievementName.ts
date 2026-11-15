export const DungeonsAchievementName = {
  DungeonCrawler: "DungeonCrawler",
  DungeonHomeowner: "DungeonHomeowner",
  DungeonMaster: "DungeonMaster",
  MonsterCatcher: "MonsterCatcher",
  MonsterCollector: "MonsterCollector",
  MonsterElite: "MonsterElite",
  MonsterTrainer: "MonsterTrainer",
} as const;
export type DungeonsAchievementName = (typeof DungeonsAchievementName)[keyof typeof DungeonsAchievementName];
