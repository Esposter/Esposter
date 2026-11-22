export const uncapitalize = <T extends string>(string: T) =>
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Uncapitalize is the compiler's intrinsic over a literal T, which a runtime case change over a string cannot produce
  `${string.charAt(0).toLowerCase()}${string.slice(1)}` as Uncapitalize<T>;
