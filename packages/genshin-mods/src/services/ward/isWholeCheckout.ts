// The pathspecs git reads as every path of the checkout, from its root or the folder the command runs in
const WHOLE_CHECKOUT_PATHSPECS: ReadonlySet<string> = new Set([".", "./", ":/", ":/."]);

export const isWholeCheckout = (operands: string[]) =>
  operands.some((operand) => WHOLE_CHECKOUT_PATHSPECS.has(operand));
