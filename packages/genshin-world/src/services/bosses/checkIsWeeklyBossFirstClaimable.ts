import { computeWeeklyBossTopClearKey } from "#src/services/bosses/markWeeklyBossTopClear";

// Whether a weekly boss's first clear can be claimed: its highest difficulty has been cleared, and the claim has not been
// Made, which it records by the entry id alone
export const checkIsWeeklyBossFirstClaimable = (clearedDomainIds: ReadonlySet<string>, entryId: number): boolean =>
  clearedDomainIds.has(computeWeeklyBossTopClearKey(entryId)) && !clearedDomainIds.has(String(entryId));
