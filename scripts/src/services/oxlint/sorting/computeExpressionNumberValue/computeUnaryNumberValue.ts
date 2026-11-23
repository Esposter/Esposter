export const computeUnaryNumberValue = (operator: string, argument: number): number | undefined => {
  switch (operator) {
    case "-":
      return -argument;
    case "+":
      return argument;
    case "~":
      return ~argument;
    default:
      return undefined;
  }
};
