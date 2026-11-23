/* oxlint-disable no-await-in-loop -- Order is the contract: each group's fit decides whether the search goes on, and
   fits run one at a time, as runFits runs its fits */
import type { GroundPieceFit } from "#src/models/genshinAssets/fit/GroundPieceFit";

import { ID_SEPARATOR, takeOne } from "@esposter/shared";

// A group of a split's quarters, by their indices in `splitGroundPiece`'s order, where a quarter's bit zero is its east
// Half And its bit one its north half, with the fit of the group as one piece
interface QuarterGroup {
  fit: GroundPieceFit;
  indices: number[];
}

// The groups a split's four quarters are fitted as, from each quarter's fit and `fitGroup`, the fit of any group of
// Them as One piece. A quarter reading under the minimum joins the quarters sharing an edge with it that no group has
// Taken, fewest Samples first and the lower index on a tie, and takes the first whose group holds its gate and reads on
// The minimum. A Group still under the minimum keeps joining the same way, and the union of all four, the parent, which
// Has already missed, Is never fitted. A quarter that holds alone stays its own group unless a group it joins holds,
// And a quarter no group holds Is left alone for its own fit to refuse. Each group comes back in the order of its
// Lowest index
export const groupGroundQuarters = async (
  fits: readonly GroundPieceFit[],
  minimum: number,
  fitGroup: (indices: number[]) => Promise<GroundPieceFit>,
): Promise<QuarterGroup[]> => {
  const getSampleCount = (quarter: number): number => takeOne(fits, quarter).sampleCount;
  const quarterGroupMap = new Map<number, QuarterGroup>();
  const indicesFitMap = new Map<string, GroundPieceFit>();
  // A group is fitted once, since the search from one quarter and from its sibling reach the same groups
  const getGroupFit = async (indices: number[]): Promise<GroundPieceFit> => {
    const key = indices.join(ID_SEPARATOR);
    const known = indicesFitMap.get(key);
    if (known !== undefined) return known;
    const fit = await fitGroup(indices);
    indicesFitMap.set(key, fit);
    return fit;
  };
  // A group under search, with the siblings it has yet to join, fewest samples first
  const createSearchLevel = (indices: number[]) => ({
    indices,
    siblings: [...new Set(indices.flatMap((index) => [index ^ 1, index ^ 2]))]
      .filter((sibling) => !indices.includes(sibling) && !quarterGroupMap.has(sibling))
      .toSorted(
        (firstSibling, secondSibling) =>
          getSampleCount(firstSibling) - getSampleCount(secondSibling) || firstSibling - secondSibling,
      ),
  });
  // The first group the quarter reaches by joining adjacent quarters one at a time, depth first: a group still under
  // The Minimum is searched through its own siblings before the next sibling of the group it joined is tried
  const findGroup = async (quarter: number): Promise<QuarterGroup | undefined> => {
    const levels = [createSearchLevel([quarter])];
    let level = levels.at(-1);
    while (level !== undefined) {
      const sibling = level.siblings.shift();
      if (sibling === undefined) levels.pop();
      else {
        const joined = [...level.indices, sibling].toSorted(
          (firstQuarter, secondQuarter) => firstQuarter - secondQuarter,
        );
        // The union of all four is the parent, which has already missed
        if (joined.length !== fits.length) {
          const fit = await getGroupFit(joined);
          if (fit.sampleCount < minimum) levels.push(createSearchLevel(joined));
          else if (fit.isHeld) return { fit, indices: joined };
        }
      }
      level = levels.at(-1);
    }
    return undefined;
  };
  for (const [quarter, fit] of fits.entries()) {
    if (fit.sampleCount >= minimum || quarterGroupMap.has(quarter)) continue;
    const group = await findGroup(quarter);
    if (group === undefined) continue;
    for (const member of group.indices) quarterGroupMap.set(member, group);
  }
  const groups: QuarterGroup[] = [];
  for (const [quarter, fit] of fits.entries()) {
    const group = quarterGroupMap.get(quarter) ?? { fit, indices: [quarter] };
    // A group is listed at its lowest index, where its first member comes up
    if (group.indices[0] === quarter) groups.push(group);
  }
  return groups;
};
