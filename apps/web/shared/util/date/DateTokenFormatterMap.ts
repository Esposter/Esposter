import {
  EN_US_LONG_MONTH_FORMATTER,
  EN_US_LONG_WEEKDAY_FORMATTER,
  EN_US_ORDINAL_PLURAL_RULES,
  EN_US_SHORT_MONTH_FORMATTER,
  EN_US_SHORT_WEEKDAY_FORMATTER,
} from "#shared/services/intl/constants";
import { DateToken } from "#shared/util/date/DateToken";

const PADDED_LENGTH = 2;
const YEAR_LENGTH = 4;
const NOON_HOUR = 12;
const OrdinalSuffixMap: Record<Intl.LDMLPluralRule, string> = {
  few: "rd",
  many: "th",
  one: "st",
  other: "th",
  two: "nd",
  zero: "th",
};

const padNumber = (value: number, length = PADDED_LENGTH): string => String(value).padStart(length, "0");
// Month and weekday names come from Intl rather than a hand-written table, and pinned to en-US rather than the
// Reader's locale: these tokens only reach the message list and the resource table, whose labels are the one
// Place a format string is still written by hand instead of being a `<NuxtTime>` (/docs/architecture/date-time-display).
const formatDatePart = (formatter: Intl.DateTimeFormat, zonedDateTime: Temporal.ZonedDateTime): string =>
  formatter.format(new Date(zonedDateTime.epochMilliseconds));

export const DateTokenFormatterMap: Record<DateToken, (zonedDateTime: Temporal.ZonedDateTime) => string> = {
  [DateToken.A]: ({ hour }) => (hour < NOON_HOUR ? "AM" : "PM"),
  [DateToken.D]: ({ day }) => String(day),
  [DateToken.DD]: ({ day }) => padNumber(day),
  [DateToken.ddd]: (zonedDateTime) => formatDatePart(EN_US_SHORT_WEEKDAY_FORMATTER, zonedDateTime),
  [DateToken.dddd]: (zonedDateTime) => formatDatePart(EN_US_LONG_WEEKDAY_FORMATTER, zonedDateTime),
  [DateToken.Do]: ({ day }) => `${day}${OrdinalSuffixMap[EN_US_ORDINAL_PLURAL_RULES.select(day)]}`,
  [DateToken.H]: ({ hour }) => String(hour),
  [DateToken.h]: ({ hour }) => String(hour % NOON_HOUR || NOON_HOUR),
  [DateToken.HH]: ({ hour }) => padNumber(hour),
  [DateToken.hh]: ({ hour }) => padNumber(hour % NOON_HOUR || NOON_HOUR),
  [DateToken.M]: ({ month }) => String(month),
  [DateToken.MM]: ({ month }) => padNumber(month),
  [DateToken.mm]: ({ minute }) => padNumber(minute),
  [DateToken.MMM]: (zonedDateTime) => formatDatePart(EN_US_SHORT_MONTH_FORMATTER, zonedDateTime),
  [DateToken.MMMM]: (zonedDateTime) => formatDatePart(EN_US_LONG_MONTH_FORMATTER, zonedDateTime),
  [DateToken.ss]: ({ second }) => padNumber(second),
  [DateToken.YYYY]: ({ year }) => padNumber(year, YEAR_LENGTH),
  [DateToken.Z]: ({ offset }) => offset,
};
