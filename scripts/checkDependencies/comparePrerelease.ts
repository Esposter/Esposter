export const comparePrerelease = (left?: string, right?: string): number => {
  if (!left && !right) return 0;
  if (!left) return 1;
  if (!right) return -1;

  return left.localeCompare(right, undefined, { numeric: true });
};
