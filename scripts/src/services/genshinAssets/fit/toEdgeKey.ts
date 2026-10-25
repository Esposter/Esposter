export const toEdgeKey = (first: number, second: number): string =>
  first < second ? `${first},${second}` : `${second},${first}`;
