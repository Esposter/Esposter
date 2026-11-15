export const WebpageAchievementName = { WebDeveloper: "WebDeveloper" } as const;
export type WebpageAchievementName = (typeof WebpageAchievementName)[keyof typeof WebpageAchievementName];
