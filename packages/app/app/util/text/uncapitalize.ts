export const uncapitalize = <T extends string>(string: T) =>
  `${string.charAt(0).toLowerCase()}${string.slice(1)}` as Uncapitalize<T>;
