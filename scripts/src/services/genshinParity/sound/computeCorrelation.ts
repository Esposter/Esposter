export const computeCorrelation = (left: Float32Array, right: Float32Array): number => {
  let product = 0;
  let leftPower = 0;
  let rightPower = 0;
  for (const [index, sample] of left.entries()) {
    const other = right[index] ?? 0;
    product += sample * other;
    leftPower += sample * sample;
    rightPower += other * other;
  }
  return product / Math.sqrt(leftPower * rightPower);
};
