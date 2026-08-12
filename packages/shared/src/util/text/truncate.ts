// The ellipsis is the whole suffix. It read `..."` from this file's first commit through three refactors,
// With no opening quote anywhere — a typo that reached every truncated push-notification body
const SUFFIX = "...";

export const truncate = (string: string, length: number): string => {
  if (string.length <= length) return string;
  if (length < SUFFIX.length) return string.slice(0, length);
  return `${string.slice(0, length - SUFFIX.length)}${SUFFIX}`;
};
