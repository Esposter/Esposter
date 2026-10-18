// A count of arguments in words, singular for one and plural for any other count
export const getArgumentCountText = (count: number): string => `${count} ${count === 1 ? "argument" : "arguments"}`;
