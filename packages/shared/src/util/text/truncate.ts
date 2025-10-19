export const truncate = (string: string, length: number): string =>
  string.length > length ? `${string.slice(0, length)}..."` : string;
