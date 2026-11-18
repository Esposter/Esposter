// The groups a split's four quarters are fitted as, by their indices in `splitGroundPiece`'s order, where a quarter's bit
// Zero is its east half and its bit one its north half. A quarter reading under the minimum joins the sibling sharing an
// Edge with it that reads the fewest samples, the lower index on a tie, and a quarter already joined is no sibling. Each
// Group comes back in the order of its lowest index, as a single quarter or a pair
export const groupGroundQuarters = (sampleCounts: readonly number[], minimum: number): number[][] => {
  const countOf = (quarter: number): number => sampleCounts[quarter] ?? Number.POSITIVE_INFINITY;
  const partnerOf = new Map<number, number>();
  for (const [quarter, count] of sampleCounts.entries()) {
    if (count >= minimum || partnerOf.has(quarter)) continue;
    const [sibling] = [quarter ^ 1, quarter ^ 2]
      .filter((candidate) => !partnerOf.has(candidate))
      .toSorted(
        (firstQuarter, secondQuarter) => countOf(firstQuarter) - countOf(secondQuarter) || firstQuarter - secondQuarter,
      );
    // A quarter with no free sibling stays alone, and its refusal for its count stands
    if (sibling === undefined) continue;
    partnerOf.set(quarter, sibling);
    partnerOf.set(sibling, quarter);
  }
  const groups: number[][] = [];
  for (const quarter of sampleCounts.keys()) {
    const partner = partnerOf.get(quarter);
    if (partner === undefined) groups.push([quarter]);
    else if (quarter < partner) groups.push([quarter, partner]);
  }
  return groups;
};
