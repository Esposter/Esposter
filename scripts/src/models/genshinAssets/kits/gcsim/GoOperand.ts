// A number an operand holds, and whether it is a float: one by its whole-valued wrapper, or by a fraction it holds
export interface GoOperand {
  isFloat: boolean;
  value: number;
}
