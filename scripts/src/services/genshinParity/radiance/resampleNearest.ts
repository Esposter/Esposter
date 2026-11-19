// Each target pixel takes the value of its nearest source pixel, so a mask or a share read at the source's size
// Lands on the target grid without being filtered into values no source pixel holds
export const resampleNearest = (
  source: ArrayLike<number>,
  sourceWidth: number,
  sourceHeight: number,
  width: number,
  height: number,
): Float32Array =>
  Float32Array.from({ length: width * height }, (_value, pixel) => {
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    const sourceX = Math.min(sourceWidth - 1, Math.floor(((x + 0.5) * sourceWidth) / width));
    const sourceY = Math.min(sourceHeight - 1, Math.floor(((y + 0.5) * sourceHeight) / height));
    return source[sourceY * sourceWidth + sourceX] ?? 0;
  });
