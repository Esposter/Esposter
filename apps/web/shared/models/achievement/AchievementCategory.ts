export const AchievementCategory = {
  Clicker: "Clicker",
  Dungeons: "Dungeons",
  Email: "Email",
  Like: "Like",
  Message: "Message",
  Post: "Post",
  Room: "Room",
  Special: "Special",
  Survey: "Survey",
  Table: "Table",
  Webpage: "Webpage",
} as const;
export type AchievementCategory = (typeof AchievementCategory)[keyof typeof AchievementCategory];
