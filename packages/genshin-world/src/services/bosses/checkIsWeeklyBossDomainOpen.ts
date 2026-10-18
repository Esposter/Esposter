// Whether a weekly boss's Trounce Domain is open: every quest that introduces the boss is done. A boss with no
// Introducing quest opens at once. Its quests are numbered as the main quests are, and the completed set holds them as
// Strings
export const checkIsWeeklyBossDomainOpen = (
  introQuestIds: readonly number[],
  completedMainQuestIds: ReadonlySet<string>,
): boolean => introQuestIds.every((id) => completedMainQuestIds.has(String(id)));
