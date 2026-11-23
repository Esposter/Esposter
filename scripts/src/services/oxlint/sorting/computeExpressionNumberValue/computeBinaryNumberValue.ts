export const computeBinaryNumberValue = (operator: string, left: number, right: number): number | undefined => {
  switch (operator) {
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "**":
      return left ** right;
    case "/":
      return left / right;
    case "&":
      return left & right;
    case "%":
      return left % right;
    case "^":
      return left ^ right;
    case "+":
      return left + right;
    case "<<":
      return left << right;
    case ">>":
      return left >> right;
    case "|":
      return left | right;
    default:
      return undefined;
  }
};
