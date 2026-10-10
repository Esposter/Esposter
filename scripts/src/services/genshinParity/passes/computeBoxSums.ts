// The sum of each pixel's window of `values`, a square of `radius` pixels each way clipped at the frame's edges, read
// From one integral image so every window costs the same whatever its radius
export const computeBoxSums = (
  values: ArrayLike<number>,
  width: number,
  height: number,
  radius: number,
): Float64Array => {
  const stride = width + 1;
  const integral = new Float64Array(stride * (height + 1));
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      integral[(y + 1) * stride + x + 1] =
        (values[y * width + x] ?? 0) +
        (integral[y * stride + x + 1] ?? 0) +
        (integral[(y + 1) * stride + x] ?? 0) -
        (integral[y * stride + x] ?? 0);
  const sums = new Float64Array(width * height);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const [left, right] = [Math.max(0, x - radius), Math.min(width, x + radius + 1)];
      const [top, bottom] = [Math.max(0, y - radius), Math.min(height, y + radius + 1)];
      sums[y * width + x] =
        (integral[bottom * stride + right] ?? 0) -
        (integral[top * stride + right] ?? 0) -
        (integral[bottom * stride + left] ?? 0) +
        (integral[top * stride + left] ?? 0);
    }
  return sums;
};
