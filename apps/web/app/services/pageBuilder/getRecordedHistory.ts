import type { PageBuilderHistoryEntry } from "@/models/pageBuilder/PageBuilderHistoryEntry";
import type { History } from "@esposter/shared";

import { checkIsSamePaths } from "@/services/pageBuilder/checkIsSamePaths";
import { JsonPatchOperationType, pushHistory } from "@esposter/shared";

// The history an edit leaves: a new entry joins the past, unless it continues the newest entry, in the same interaction
// And setting the same paths. That entry keeps its label and inverses, so undoing it returns to before the interaction
// An edit only continues an entry when both overwrote values the document held: an insert into an array shifts the
// Nodes after it, so a second insert at the same index is a new entry rather than a replacement of the first
export const getRecordedHistory = (
  history: History<PageBuilderHistoryEntry>,
  entry: PageBuilderHistoryEntry,
): History<PageBuilderHistoryEntry> => {
  if (entry.operations.length === 0) return history;

  const newestEntry = history.past.at(-1);
  if (
    newestEntry?.interactionId === undefined ||
    newestEntry.interactionId !== entry.interactionId ||
    !checkIsSamePaths(newestEntry.operations, entry.operations) ||
    ![...newestEntry.inverses, ...entry.inverses].every(({ op }) => op === JsonPatchOperationType.Replace)
  )
    return pushHistory(history, entry);

  return {
    future: [],
    limit: history.limit,
    past: [...history.past.slice(0, -1), { ...newestEntry, operations: entry.operations }],
  };
};
