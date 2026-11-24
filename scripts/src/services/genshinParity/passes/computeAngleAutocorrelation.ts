// The autocorrelation of a family's normal angles along the rows of a frame: each lag's mean product of two angles that
// Stand that many pixels apart in a row, both in the family, over the angles' variance, so lag 0 is one. A pixel
// Outside the family is NaN, and a pair is read only where both of its pixels are in it. A family whose angles do not
// Vary reads zero at every lag
export const computeAngleAutocorrelation = (angles: Float64Array, width: number, maxLag: number): number[] => {
  const height = angles.length / width;
  let sum = 0;
  let count = 0;
  for (const angle of angles)
    if (!Number.isNaN(angle)) {
      sum += angle;
      count++;
    }
  if (count === 0) return Array.from({ length: maxLag + 1 }, () => 0);
  const mean = sum / count;
  let variance = 0;
  for (const angle of angles) if (!Number.isNaN(angle)) variance += (angle - mean) ** 2;
  if (variance === 0) return Array.from({ length: maxLag + 1 }, () => 0);
  return Array.from({ length: maxLag + 1 }, (_value, lag) => {
    let products = 0;
    let pairs = 0;
    for (let y = 0; y < height; y++)
      for (let x = 0; x + lag < width; x++) {
        const first = angles[y * width + x] ?? Number.NaN;
        const second = angles[y * width + x + lag] ?? Number.NaN;
        if (Number.isNaN(first) || Number.isNaN(second)) continue;
        products += (first - mean) * (second - mean);
        pairs++;
      }
    return pairs === 0 ? 0 : products / pairs / (variance / count);
  });
};
