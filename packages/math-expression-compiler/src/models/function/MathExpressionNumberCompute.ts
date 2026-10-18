// A computation that takes the numbers of a call as one array, never spread into arguments, and yields null where mathjs would throw
export type MathExpressionNumberCompute = (values: readonly number[]) => null | number;
