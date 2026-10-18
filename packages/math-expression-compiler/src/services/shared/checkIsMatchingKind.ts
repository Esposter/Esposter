import { MathExpressionParameterType } from "#src/models/function/MathExpressionParameterType";

export const checkIsMatchingKind = (
  parameterType: MathExpressionParameterType | undefined,
  argumentType: MathExpressionParameterType,
): boolean => parameterType === MathExpressionParameterType.Any || parameterType === argumentType;
