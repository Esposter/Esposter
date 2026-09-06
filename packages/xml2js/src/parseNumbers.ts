export const parseNumbers = (string: string): number | string => {
  const number = Number(string);
  return Number.isNaN(number) ? string : number;
};
