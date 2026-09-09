const SUFFIX = "...";

export const truncate = (string: string, length: number): string => {
  if (string.length <= length) return string;
  else if (length < SUFFIX.length) return string.slice(0, length);
  else return `${string.slice(0, length - SUFFIX.length)}${SUFFIX}`;
};
