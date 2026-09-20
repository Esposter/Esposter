import { DAY_IN_MILLISECONDS } from "#src/services/constants";

// Whole days from one "YYYY-MM-DD" to another; a date-only string parses as UTC midnight, so no zone can shift it
export const getDaysBetween = (fromIsoDate: string, toIsoDate: string): number =>
  Math.round((Date.parse(toIsoDate) - Date.parse(fromIsoDate)) / DAY_IN_MILLISECONDS);
