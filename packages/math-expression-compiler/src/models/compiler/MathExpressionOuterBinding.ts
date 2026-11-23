// The value an assigned name holds before its assignment runs: the variable of that name, else the constant, else
// Nothing
export interface MathExpressionOuterBinding {
  constant?: number | undefined;
  variableIndex?: number | undefined;
}
