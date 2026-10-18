import { checkIsWeeklyBossDomainOpen } from "#src/services/bosses/checkIsWeeklyBossDomainOpen";
import { EntryIdIntroQuestIdsMap } from "#src/services/bosses/constants";

// Whether the Trounce Domain an entry id names is open: the quests that introduce its weekly boss are done. An entry with
// No introducing quests, which is every entry but the weekly bosses', is open at once
export const checkIsWeeklyBossEntryOpen = (entryId: number, completedMainQuestIds: ReadonlySet<string>): boolean =>
  checkIsWeeklyBossDomainOpen(EntryIdIntroQuestIdsMap[entryId] ?? [], completedMainQuestIds);
