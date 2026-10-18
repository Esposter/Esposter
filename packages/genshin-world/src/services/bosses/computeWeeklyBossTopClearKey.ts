// The mark a weekly boss's highest difficulty leaves in the cleared set, under a key of its own, so the boss's first
// Clear claimed keeps the entry id alone. The set is saved as a list of strings, so the mark needs no save field of its own
export const computeWeeklyBossTopClearKey = (entryId: number): string => `${entryId}:top`;
