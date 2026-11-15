export const BackgroundMusicKey = {
  AndTheJourneyBegins: "AndTheJourneyBegins",
  DecisiveBattle: "DecisiveBattle",
  Title: "Title",
} as const;
export type BackgroundMusicKey = (typeof BackgroundMusicKey)[keyof typeof BackgroundMusicKey];
