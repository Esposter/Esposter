import { dayjs } from "#shared/services/dayjs";
import { countOccurrences } from "#shared/util/array/countOccurrences";

export const computeMonthFrequencies = (dates: string[]): readonly (readonly [string, number])[] => {
  const months = dates
    .map((value) => dayjs(value))
    .filter((parsedDate) => parsedDate.isValid())
    .map((parsedDate) => parsedDate.format("YYYY-MM"));
  return [...countOccurrences(months)].toSorted(([monthA], [monthB]) => monthA.localeCompare(monthB));
};
