// Whether a pixel of the witness's part target lies inside its part: drawn, and its eight neighbours all the same part.
// A part's edge pixels are where a pose a pixel off reads the sky or the part behind in the reference, which a thin far
// Column is little but, so a read over a part's pixels keeps to its interior
export const checkIsPartInterior = (part: Float32Array, width: number, height: number, pixel: number): boolean => {
  const id = part[pixel * 4];
  if (!id) return false;
  const x = pixel % width;
  const y = Math.floor(pixel / width);
  if (x === 0 || y === 0 || x === width - 1 || y === height - 1) return false;
  for (let offsetY = -1; offsetY <= 1; offsetY++)
    for (let offsetX = -1; offsetX <= 1; offsetX++)
      if (part[(pixel + offsetY * width + offsetX) * 4] !== id) return false;
  return true;
};
