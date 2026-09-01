import type { ResourceType } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { SnapshotSummaryMap } from "#shared/services/resource/SnapshotSummaryMap";
import { getResult } from "@esposter/shared";

// The one line a history row says about its own content, computed where the snapshot is taken and carried in
// Its blob metadata — the listing is one round trip for the whole history, and a summary derived on read would
// Cost one download per row.
//
// Best-effort by design: a snapshot is stored as the bytes it was taken from rather than as whatever today's
// Schema can parse out of them, so content this schema cannot read still becomes a snapshot. It simply has no
// Summary, and the row falls back to its reason, its label and its time
export const getSnapshotSummary = (type: ResourceType, serializedContent: string): string => {
  const summarize = SnapshotSummaryMap[type];
  if (!summarize) return "";

  const parsedContent = getResult(() =>
    // eslint-disable-next-line no-restricted-syntax -- the content schema owns date coercion, exactly as readContentBlob relies on
    ResourceDefinitionMap[type].contentSchema.safeParse(JSON.parse(serializedContent)),
  ).unwrapOr(undefined);
  if (!parsedContent?.success) return "";
  // Reached through a runtime resource type, so the parameter collapses to the intersection of every content
  // Shape; the content was parsed by that same type's schema on the line above, so it is pinned back to what
  // The declaration takes — the same narrowing `reapplyLiveResourceContent` does one layer up
  return (summarize as (content: unknown) => string)(parsedContent.data);
};
