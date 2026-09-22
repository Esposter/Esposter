// The character a session meets, drawn by the tier's own odds rather than taken as its top answer, which met the
// Same character every session near a birthday. The draw is a number in [0, 1) the caller supplies, so the walk is
// Pure; odds summing to other than one are walked as a share of their total
export const drawLoreChoice = (probabilities: Readonly<Record<string, number>>, draw: number): string | undefined => {
  const entries = Object.entries(probabilities);
  const total = entries.reduce((sum, [, probability]) => sum + probability, 0);
  let remaining = draw * total;
  for (const [name, probability] of entries) {
    if (remaining < probability) return name;
    remaining -= probability;
  }
  return undefined;
};
