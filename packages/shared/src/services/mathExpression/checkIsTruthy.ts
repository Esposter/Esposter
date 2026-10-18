// A number is truthy unless it is zero or NaN, as mathjs reads a condition
export const checkIsTruthy = (value: number): boolean => value !== 0 && !Number.isNaN(value);
