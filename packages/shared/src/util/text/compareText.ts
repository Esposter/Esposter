export const compareText = (firstText: string, secondText: string): number => {
  if (firstText === secondText) return 0;

  return firstText < secondText ? -1 : 1;
};
