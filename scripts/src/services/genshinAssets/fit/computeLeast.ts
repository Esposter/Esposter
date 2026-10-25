// The least of many values, reduced rather than spread, since a surface's cells run past the arguments a call can take
export const computeLeast = (values: readonly number[]): number =>
  values.reduce((least, value) => Math.min(least, value));
