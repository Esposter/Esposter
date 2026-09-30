// Numbers a tree prints, each to the hundredth and joined by commas
export const formatNumbers = (values: readonly number[]): string =>
  values.map((value) => String(Math.round(value * 100) / 100)).join(",");
