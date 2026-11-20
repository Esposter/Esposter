import type { ResourceType } from "@esposter/db-schema";

import { SnapshotSummaryMap } from "#shared/services/resource/SnapshotSummaryMap";

// Computes the line SnapshotSummaryMap declares, at the moment a snapshot is taken. Best-effort, because a
// Snapshot stores the bytes it was taken from rather than whatever today's schema can parse out of them: content
// This schema cannot read still becomes a snapshot, with the row falling back to its reason and its time
export const getSnapshotSummary = (type: ResourceType, serializedContent: string): string => {
  const summarize = SnapshotSummaryMap[type];
  if (!summarize) return "";

  return summarize(serializedContent);
};
