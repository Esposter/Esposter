export const gcd = (first: number, second: number): number => (second === 0 ? first : gcd(second, first % second));
