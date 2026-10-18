// The value an assigned name holds before its assignment runs: the variable of that name, else the constant, else nothing
export interface MathExpressionOuterBinding {
  constant?: number;
  variableIndex?: number;
}
