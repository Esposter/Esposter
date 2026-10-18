import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";

// An area's exploration as the map shows it: the done weight as a percentage of the total, rounded down, and never past
// 100, which the English map reads in gold once an area is fully explored. Provisional: the weights are the table's,
// And they do not yet fit the totals. Galesong Hill's nineteen doings at ten each make 190 against its total of 146,
// And the one recording of the map's steps shows a single chest taking it from 99% to 100%, which nearly any chest's
// Weight fits, so the scale waits on a recording of more steps
export const computeExplorationProgress = (
  { doings, total }: Pick<ExplorationArea, "doings" | "total">,
  exploredDoingIds: ReadonlySet<string>,
): number => {
  const doneWeight = doings.reduce((sum, { id, weight }) => (exploredDoingIds.has(id) ? sum + weight : sum), 0);
  return Math.min(Math.floor((doneWeight * 100) / total), 100);
};
