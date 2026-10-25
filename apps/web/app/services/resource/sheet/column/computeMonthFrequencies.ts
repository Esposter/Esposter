import { formatDate } from "#shared/util/date/formatDate";
import { parseLooseDate } from "#shared/util/date/parseLooseDate";
import { MONTH_FORMAT } from "@/services/resource/sheet/column/constants";
import { countOccurrences } from "@/util/array/countOccurrences";

export const computeMonthFrequencies = (dates: string[]): readonly (readonly [string, number])[] => {
  const months = dates
    .map((value) => parseLooseDate(value))
    .filter((parsedDate) => parsedDate !== undefined)
    .map((parsedDate) => formatDate(parsedDate, MONTH_FORMAT));
  return [...countOccurrences(months)].toSorted(([firstMonth], [secondMonth]) => firstMonth.localeCompare(secondMonth));
};
