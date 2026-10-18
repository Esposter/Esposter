// The mark a weekly boss's highest difficulty leaves in the cleared set, under a key of its own, so that the boss's first clear
// Claimed keeps the entry id alone. The set is saved as a list of strings, so the mark needs no save field of its own
export const computeWeeklyBossTopClearKey = (entryId: number): string => `${entryId}:top`;

export const markWeeklyBossTopClear = (clearedDomainIds: ReadonlySet<string>, entryId: number): ReadonlySet<string> =>
  new Set([...clearedDomainIds, computeWeeklyBossTopClearKey(entryId)]);
