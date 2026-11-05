// Counts the holds on each code up as a hold presses it and down as a hold lets it go, and answers the codes whose count
// Crosses zero: a code is pressed when its first hold starts and let go when its last one ends, so a hold that overlaps
// Another never lets go of a code the other still holds
export const updateHoldCounts = (
  codeHoldCountMap: Map<string, number>,
  { codes, isPressed }: { codes: readonly string[]; isPressed: boolean },
): string[] => {
  const crossedCodes: string[] = [];
  for (const code of codes) {
    const count = codeHoldCountMap.get(code) ?? 0;
    const nextCount = count + (isPressed ? 1 : -1);
    if (nextCount === 0) codeHoldCountMap.delete(code);
    else codeHoldCountMap.set(code, nextCount);

    const isCrossed = isPressed ? count === 0 : nextCount === 0;
    if (isCrossed) crossedCodes.push(code);
  }

  return crossedCodes;
};
