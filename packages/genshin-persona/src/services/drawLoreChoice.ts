import { LORE_EVEN_SHARE } from "#src/services/constants";

// The character a session meets, drawn rather than taken: the tier's top answer alone is the same character every
// Session near a birthday, so the draw walks a blend of its odds and an even share over the whole roster. The draw
// Is a number in [0, 1) the caller supplies, so the walk itself is pure
export const drawLoreChoice = (
  probabilities: Readonly<Record<string, number>>,
  names: string[],
  draw: number,
): string | undefined => {
  const total = names.reduce((sum, name) => sum + (probabilities[name] ?? 0), 0);
  let remaining = draw;
  for (const name of names) {
    const lore = total > 0 ? (probabilities[name] ?? 0) / total : 0;
    // With no odds to lean on the roster is drawn evenly
    const weight = total > 0 ? (1 - LORE_EVEN_SHARE) * lore + LORE_EVEN_SHARE / names.length : 1 / names.length;
    if (remaining < weight) return name;
    remaining -= weight;
  }
  // Rounding can leave the last sliver of the walk unclaimed
  return names.at(-1);
};
