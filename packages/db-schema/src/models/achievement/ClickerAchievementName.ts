export const ClickerAchievementName = {
  ClickerAddict: "ClickerAddict",
  ClickerArchitect: "ClickerArchitect",
  ClickerBillionaire: "ClickerBillionaire",
  ClickerChampion: "ClickerChampion",
  ClickerCompletionist: "ClickerCompletionist",
  ClickerMillionaire: "ClickerMillionaire",
  ClickerNovice: "ClickerNovice",
  ClickerPro: "ClickerPro",
  ClickerSaver: "ClickerSaver",
  ClickerTrillionaire: "ClickerTrillionaire",
} as const;
export type ClickerAchievementName = (typeof ClickerAchievementName)[keyof typeof ClickerAchievementName];
