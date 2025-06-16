export const truncate = (string: string, length: number) =>
  string.length > length ? `${string.substring(0, length)}..."` : string;
