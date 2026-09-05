import type { ResourceType } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { SnapshotSummaryMap } from "#shared/services/resource/SnapshotSummaryMap";
import { getResult } from "@esposter/shared";

// Computes the line SnapshotSummaryMap declares, at the moment a snapshot is taken. Best-effort, because a
// Snapshot stores the bytes it was taken from rather than whatever today's schema can parse out of them: content
// This schema cannot read still becomes a snapshot, with the row falling back to its reason, label and time
export const getSnapshotSummary = (type: ResourceType, serializedContent: string): string => {
  const summarize = SnapshotSummaryMap[type];
  if (!summarize) return "";

  const parsedContent = getResult(() =>
    // eslint-disable-next-line no-restricted-syntax -- the content schema owns date coercion, exactly as readContentBlob relies on
    ResourceDefinitionMap[type].contentSchema.safeParse(JSON.parse(serializedContent)),
  ).unwrapOr(undefined);
  if (!parsedContent?.success) return "";
  // Reached through a runtime resource type, so the parameter collapses to the intersection of every content
  // Shape; the line above parsed the content with that same type's schema, so it is pinned back to what the
  // Declaration takes
  return (summarize as (content: unknown) => string)(parsedContent.data);
};
