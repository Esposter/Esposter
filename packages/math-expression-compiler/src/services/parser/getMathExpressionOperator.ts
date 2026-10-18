// The function or logical operator that a token names at a level, or undefined when the token is no operator of the level
export const getMathExpressionOperator = <T extends string>(
  operators: Readonly<Record<string, T>>,
  token: string,
): T | undefined => (Object.hasOwn(operators, token) ? operators[token] : undefined);
