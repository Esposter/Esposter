export const EmailAchievementName = { EmailMarketer: "EmailMarketer" } as const;
export type EmailAchievementName = (typeof EmailAchievementName)[keyof typeof EmailAchievementName];
