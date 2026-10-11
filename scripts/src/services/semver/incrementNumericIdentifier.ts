// BigInt keeps the bound exact past Number's safe integers, where a huge version would round
export const incrementNumericIdentifier = (identifier: string): string => (BigInt(identifier) + 1n).toString();
