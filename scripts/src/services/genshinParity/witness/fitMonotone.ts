// The nearest non-decreasing sequence to a weighted one in least squares, by pooling adjacent violators: each run that
// Falls is replaced by its weighted mean, merging backwards until no run falls
export const fitMonotone = (values: readonly number[], weights: readonly number[]): number[] => {
  let blocks: { count: number; mean: number; weight: number }[] = [];
  for (const [index, value] of values.entries()) {
    blocks.push({ count: 1, mean: value, weight: weights[index] ?? 0 });
    while (blocks.length > 1) {
      const last = blocks.at(-1);
      const previous = blocks.at(-2);
      if (!last || !previous || previous.mean <= last.mean) break;
      const weight = previous.weight + last.weight;
      blocks = blocks.toSpliced(-2, 2, {
        count: previous.count + last.count,
        mean:
          weight > 0
            ? (previous.mean * previous.weight + last.mean * last.weight) / weight
            : (previous.mean + last.mean) / 2,
        weight,
      });
    }
  }
  return blocks.flatMap(({ count, mean }) => Array.from({ length: count }, () => mean));
};
