import { dayjs } from "#shared/services/dayjs";
import { ISO_DATE_FORMAT } from "#shared/services/dayjs/constants";

// UTC so a day means the same day regardless of who reads or writes it. Deliberately date-only:
// A full ISO datetime inside JSON is revived into a Date by jsonDateParse, which a dataset column
// Value (boolean | null | number | string) cannot hold — a date-only string survives the round trip
export const getUtcDateString = (date: Date): string => dayjs(date).utc().format(ISO_DATE_FORMAT);
