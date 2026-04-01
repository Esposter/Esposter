import { dayjs } from "#shared/services/dayjs";

export const computeMonthFrequencies = (dates: string[]): readonly (readonly [string, number])[] => {
  const monthCounts = new Map<string, number>();
  for (const value of dates) {
    const month = dayjs(value).format("YYYY-MM");
    monthCounts.set(month, (monthCounts.get(month) ?? 0) + 1);
  }
  return [...monthCounts.entries()].toSorted(([monthA], [monthB]) => monthA.localeCompare(monthB));
};
