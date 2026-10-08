import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";

// An area's exploration as the map shows it: how many of its doings are done out of how many it counts, and the done
// Weight as a percentage of the total, rounded down so an area reads 100 only once all of its weight is done
export interface ExplorationProgress {
  doingCount: number;
  doneCount: number;
  percentage: number;
}

// Provisional: the weights are the table's, and they do not yet fit the totals. Galesong Hill's nineteen doings at ten
// Each make 190 against its total of 146, so the scale the percentage takes waits on a recording of the map's steps
export const computeExplorationProgress = (
  { doings, total }: ExplorationArea,
  exploredDoingIds: ReadonlySet<string>,
): ExplorationProgress => {
  const exploredDoings = doings.filter(({ id }) => exploredDoingIds.has(id));
  const doneWeight = exploredDoings.reduce((sum, { weight }) => sum + weight, 0);
  return {
    doingCount: doings.length,
    doneCount: exploredDoings.length,
    percentage: Math.floor((doneWeight * 100) / total),
  };
};
