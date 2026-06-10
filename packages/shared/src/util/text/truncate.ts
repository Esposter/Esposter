const SUFFIX = '..."';

export const truncate = (string: string, length: number): string => {
  if (string.length <= length) return string;
  if (length < SUFFIX.length) return string.slice(0, length);
  return `${string.slice(0, length - SUFFIX.length)}${SUFFIX}`;
};
