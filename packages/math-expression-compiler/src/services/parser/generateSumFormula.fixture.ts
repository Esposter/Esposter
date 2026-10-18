import { generateOnes } from "#src/services/parser/generateOnes.fixture";

// `sum(1, 1, …)` of `count` ones: its length grows with the formula, so the count is the scale a parse or a compile is measured over
export const generateSumFormula = (count: number): string => `sum(${generateOnes(count, ", ")})`;
