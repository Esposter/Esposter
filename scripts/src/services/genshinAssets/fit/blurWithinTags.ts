// Each cell of a grid's values averaged over the cells within `radius` of it that carry its own tag, so a material's
// Speckle is read past without one material's tone bleeding into its neighbour's
export const blurWithinTags = (
  values: Float32Array,
  tags: Int16Array,
  { height, radius, width }: { height: number; radius: number; width: number },
): Float32Array => {
  const blurred = new Float32Array(values.length);
  for (let row = 0; row < height; row++)
    for (let column = 0; column < width; column++) {
      const cell = row * width + column;
      let [sum, count] = [0, 0];
      for (
        let neighbourRow = Math.max(row - radius, 0);
        neighbourRow <= Math.min(row + radius, height - 1);
        neighbourRow++
      )
        for (
          let neighbourColumn = Math.max(column - radius, 0);
          neighbourColumn <= Math.min(column + radius, width - 1);
          neighbourColumn++
        ) {
          const neighbour = neighbourRow * width + neighbourColumn;
          if (tags[neighbour] !== tags[cell]) continue;
          sum += values[neighbour] ?? 0;
          count++;
        }
      blurred[cell] = sum / Math.max(count, 1);
    }
  return blurred;
};
