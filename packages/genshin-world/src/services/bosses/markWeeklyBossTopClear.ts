import { computeWeeklyBossTopClearKey } from "#src/services/bosses/computeWeeklyBossTopClearKey";

export const markWeeklyBossTopClear = (clearedDomainIds: ReadonlySet<string>, entryId: number): ReadonlySet<string> =>
  new Set([...clearedDomainIds, computeWeeklyBossTopClearKey(entryId)]);
