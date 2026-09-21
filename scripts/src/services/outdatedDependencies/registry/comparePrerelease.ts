export const comparePrerelease = (left: string, right: string): number => {
  if (!left && !right) return 0;
  else if (!left) return 1;
  else if (right) return left.localeCompare(right, undefined, { numeric: true });
  else return -1;
};
