import { getArgumentCountText } from "#src/services/parser/getArgumentCountText";

export const getMathExpressionArityMessage = (name: string, minArity: number, maxArity: number): string => {
  if (maxArity === Number.POSITIVE_INFINITY) return `"${name}" takes at least ${getArgumentCountText(minArity)}`;
  if (minArity === maxArity) return `"${name}" takes ${getArgumentCountText(minArity)}`;
  return `"${name}" takes ${minArity} or ${maxArity} arguments`;
};
