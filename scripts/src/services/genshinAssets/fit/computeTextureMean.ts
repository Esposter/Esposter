export const computeTextureMean = (values: Float64Array): number =>
  values.reduce((sum, value) => sum + value, 0) / values.length;
