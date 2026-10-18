import type { ExplorationDoing } from "#src/models/exploration/ExplorationDoing";

// The weight of an area's doings that are done, which the area's progress is that weight's share of its total
export const computeDoneWeight = (doings: readonly ExplorationDoing[], exploredDoingIds: ReadonlySet<string>): number =>
  doings.reduce((sum, { id, weight }) => (exploredDoingIds.has(id) ? sum + weight : sum), 0);
