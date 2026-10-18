// The ban group a sub quest names, read off its values by shape as the other fields are, since the dump scrambles their
// Names. A ban group is a string beginning with its prefix, and the caller checks it against the groups the reader knows
export const readQuestBanType = (subQuest: Record<string, unknown>): string | undefined =>
  Object.values(subQuest).find((value): value is string => typeof value === "string" && value.startsWith("BAN_GROUP_"));
