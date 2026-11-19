// The lobe a family's normal map reads, in samples, from its lobes found through several high-pass boxes: the one that
// Holds across the most of them, since a lobe that moves with its box is the box's and not the surface's. A tie goes to
// The shorter lobe, the smaller box's, as a lobe grows with its box. None where no box resolves one
export const chooseHeldLobe = (lobes: readonly (number | undefined)[]): number | undefined => {
  const counts = new Map<number, number>();
  for (const lobe of lobes) if (lobe !== undefined) counts.set(lobe, (counts.get(lobe) ?? 0) + 1);
  const [held] = [...counts.entries()].toSorted(
    ([firstLobe, firstCount], [secondLobe, secondCount]) => secondCount - firstCount || firstLobe - secondLobe,
  )[0] ?? [undefined];
  return held;
};
