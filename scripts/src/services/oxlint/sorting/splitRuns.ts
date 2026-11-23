// The runs of a list, cut after each item the predicate closes. A closing item stays in the run it ends, so a caller
// Filters what is not an item of its own, such as a spread or a hole, out of the runs it gets back
export const splitRuns = <T>(items: T[], closesRun: (item: T) => boolean): T[][] => {
  const runs: T[][] = [[]];
  for (const item of items) {
    runs.at(-1)?.push(item);
    if (closesRun(item)) runs.push([]);
  }
  return runs.filter((run) => run.length > 0);
};
