export const getMathExpressionArityMessage = (name: string, minArity: number, maxArity: number): string => {
  if (maxArity === Number.POSITIVE_INFINITY) return `"${name}" takes at least ${minArity} arguments`;
  if (minArity === maxArity) return `"${name}" takes ${minArity} arguments`;
  return `"${name}" takes ${minArity} or ${maxArity} arguments`;
};
