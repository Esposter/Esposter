import { describe } from "vitest";

// `sum(1, 1, …)` of `count` ones: its length grows with the formula, so the count is the scale a parse or a compile is measured over
export const generateSumFormula = (count: number): string =>
  `sum(${Array.from({ length: count }, () => "1").join(", ")})`;

describe.todo("generateSumFormula");
