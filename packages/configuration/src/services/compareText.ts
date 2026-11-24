// By code unit rather than `localeCompare`, which orders by the machine's locale and so moves the bytes between
// Machines
export const compareText = (firstText: string, secondText: string): number => {
  if (firstText === secondText) return 0;
  return firstText < secondText ? -1 : 1;
};
