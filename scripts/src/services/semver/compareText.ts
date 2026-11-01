export const compareText = (first: string, second: string): number => {
  if (first < second) return -1;
  else if (first > second) return 1;
  else return 0;
};
