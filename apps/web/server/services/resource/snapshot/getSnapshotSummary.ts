import type { ResourceType } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { SnapshotSummaryMap } from "#shared/services/resource/SnapshotSummaryMap";
import { getResult } from "@esposter/shared";

// Computes the line SnapshotSummaryMap declares, at the moment a snapshot is taken. Best-effort, because a
// Snapshot stores the bytes it was taken from rather than whatever today's schema can parse out of them: content
// This schema cannot read still becomes a snapshot, with the row falling back to its reason and its time
export const getSnapshotSummary = (type: ResourceType, serializedContent: string): string => {
  const summarize = SnapshotSummaryMap[type];
  if (!summarize) return "";

  const parsedContent = getResult(() =>
    // oxlint-disable-next-line no-restricted-properties -- the content schema owns date coercion, exactly as readContentBlob relies on
    ResourceDefinitionMap[type].contentSchema.safeParse(JSON.parse(serializedContent)),
  ).unwrapOr(undefined);
  if (!parsedContent?.success) return "";
  return summarize(parsedContent.data as never);
};
