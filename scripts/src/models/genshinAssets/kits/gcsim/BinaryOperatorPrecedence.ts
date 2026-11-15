export const BinaryOperatorPrecedence = { Add: "+", Divide: "/", Modulo: "%", Multiply: "*", Subtract: "-" } as const;
export type BinaryOperatorPrecedence = (typeof BinaryOperatorPrecedence)[keyof typeof BinaryOperatorPrecedence];
