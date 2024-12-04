export const uncapitalize = <T extends string>(string: T) =>
  `${string.charAt(0).toLowerCase()}${string.substring(1)}` as Uncapitalize<T>;
