export const computePolynomial = (leading: number, coefficients: readonly number[], variable: number): number => {
  let polynomial = leading;
  for (const coefficient of coefficients) polynomial = coefficient + polynomial * variable;
  return polynomial;
};
