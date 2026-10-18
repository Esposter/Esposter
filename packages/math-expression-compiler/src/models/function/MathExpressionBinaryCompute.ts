// A computation of two numbers, which yields null where mathjs would throw
export type MathExpressionBinaryCompute = (left: number, right: number) => null | number;
