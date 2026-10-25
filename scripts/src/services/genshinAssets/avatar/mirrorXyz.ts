// Each point's x negated, its w too when it has one: a tangent's handedness turns with any mirror
export const mirrorXyz = (values: readonly number[], stride: number): Float32Array => {
  const mirrored = new Float32Array(values.length);
  for (let index = 0; index < values.length; index += stride) {
    mirrored[index] = -(values[index] ?? 0);
    mirrored[index + 1] = values[index + 1] ?? 0;
    mirrored[index + 2] = values[index + 2] ?? 0;
    if (stride === 4) mirrored[index + 3] = -(values[index + 3] ?? 0);
  }
  return mirrored;
};
