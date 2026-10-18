// `count` ones joined by `separator`: the operands a sum or an operator chain is built from, so its length grows with the count
export const generateOnes = (count: number, separator: string): string =>
  Array.from({ length: count }, () => "1").join(separator);
