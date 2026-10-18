// The note a region's count of one kind gives against the wiki's count: nothing when they match, otherwise the count,
// The wiki's count and how far the count lies from it, negative for a shortfall and positive for a surplus
export const reportKindCount = (region: string, noun: string, count: number, wikiCount: number): string | undefined => {
  if (count === wikiCount) return undefined;
  return `${region}: ${count} ${noun} against the wiki's ${wikiCount}, a difference of ${count - wikiCount}`;
};
