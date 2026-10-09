import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { TravelLogEntry } from "#src/models/archive/TravelLogEntry";

import { ArchiveSection } from "#src/models/archive/ArchiveSection";

// The progress with the Travel Log entries of the finished main quests opened. An entry opened once stays open, and the
// Progress given is left as it was
export const openTravelLogEntries = (
  progress: ArchiveProgress,
  entries: readonly TravelLogEntry[],
  finishedQuestIds: ReadonlySet<number>,
): ArchiveProgress => {
  const openedIds = new Set(progress.get(ArchiveSection.TravelLog));
  for (const { id, questId } of entries) if (finishedQuestIds.has(questId)) openedIds.add(id);
  return new Map([...progress, [ArchiveSection.TravelLog, openedIds]]);
};
