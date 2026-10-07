// The angle between two normal targets' normals at a pixel, in degrees
export const computeNormalAngle = (firstNormal: Float32Array, secondNormal: Float32Array, pixel: number): number => {
  let cosine = 0;
  for (let axis = 0; axis < 3; axis++)
    cosine += (firstNormal[pixel * 4 + axis] ?? 0) * (secondNormal[pixel * 4 + axis] ?? 0);
  return (Math.acos(Math.min(Math.max(cosine, -1), 1)) * 180) / Math.PI;
};
