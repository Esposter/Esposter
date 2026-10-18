import type { ArchiveViewpoint } from "#src/models/archive/ArchiveViewpoint";

// The viewpoints offered for viewing: only those the scene group record places, by their codex ids. A viewpoint with no
// Known place is not offered anywhere in the open world
export const computeOfferedViewpoints = (
  viewpoints: readonly ArchiveViewpoint[],
  placedViewpointIds: ReadonlySet<number>,
): ArchiveViewpoint[] => viewpoints.filter(({ id }) => placedViewpointIds.has(id));
