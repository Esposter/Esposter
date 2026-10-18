// A count spent from a run, Fantasia Flowers or rewinds, if it covers the cost: the count left and whether it was spent. A
// Cost the count does not cover leaves the count as it is and spends nothing
export const spendImaginariumCount = (count: number, cost: number): { count: number; isSpent: boolean } =>
  count >= cost ? { count: count - cost, isSpent: true } : { count, isSpent: false };
