import { OrdinalSuffix } from "#shared/models/util/date/OrdinalSuffix";
import {
  EN_US_LONG_MONTH_FORMATTER,
  EN_US_LONG_WEEKDAY_FORMATTER,
  EN_US_ORDINAL_PLURAL_RULES,
  EN_US_SHORT_MONTH_FORMATTER,
  EN_US_SHORT_WEEKDAY_FORMATTER,
} from "#shared/services/intl/constants";
import { DateToken } from "#shared/util/date/DateToken";
import { padWithZeros } from "@esposter/shared";

const PADDED_LENGTH = 2;
const YEAR_LENGTH = 4;
const NOON_HOUR = 12;
const OrdinalSuffixMap: Record<Intl.LDMLPluralRule, string> = {
  [OrdinalSuffix.Few]: "rd",
  [OrdinalSuffix.Many]: "th",
  [OrdinalSuffix.One]: "st",
  [OrdinalSuffix.Other]: "th",
  [OrdinalSuffix.Two]: "nd",
  [OrdinalSuffix.Zero]: "th",
};

// Month and weekday names come from Intl rather than a hand-written table, and pinned to en-US rather than the
// Reader's locale: these tokens only reach the message list and the resource table, whose labels are the one
// Place a format string is still written by hand instead of being a `<NuxtTime>`
// (openspec/specs/architecture/date-time-display/design.md).
const formatDatePart = (formatter: Intl.DateTimeFormat, zonedDateTime: Temporal.ZonedDateTime): string =>
  formatter.format(new Date(zonedDateTime.epochMilliseconds));

export const DateTokenFormatterMap: Record<DateToken, (zonedDateTime: Temporal.ZonedDateTime) => string> = {
  [DateToken.A]: ({ hour }) => (hour < NOON_HOUR ? "AM" : "PM"),
  [DateToken.D]: ({ day }) => String(day),
  [DateToken.DD]: ({ day }) => padWithZeros(day, PADDED_LENGTH),
  [DateToken.ddd]: (zonedDateTime) => formatDatePart(EN_US_SHORT_WEEKDAY_FORMATTER, zonedDateTime),
  [DateToken.dddd]: (zonedDateTime) => formatDatePart(EN_US_LONG_WEEKDAY_FORMATTER, zonedDateTime),
  [DateToken.Do]: ({ day }) => `${day}${OrdinalSuffixMap[EN_US_ORDINAL_PLURAL_RULES.select(day)]}`,
  [DateToken.H]: ({ hour }) => String(hour),
  [DateToken.h]: ({ hour }) => String(hour % NOON_HOUR || NOON_HOUR),
  [DateToken.HH]: ({ hour }) => padWithZeros(hour, PADDED_LENGTH),
  [DateToken.hh]: ({ hour }) => padWithZeros(hour % NOON_HOUR || NOON_HOUR, PADDED_LENGTH),
  [DateToken.M]: ({ month }) => String(month),
  [DateToken.MM]: ({ month }) => padWithZeros(month, PADDED_LENGTH),
  [DateToken.mm]: ({ minute }) => padWithZeros(minute, PADDED_LENGTH),
  [DateToken.MMM]: (zonedDateTime) => formatDatePart(EN_US_SHORT_MONTH_FORMATTER, zonedDateTime),
  [DateToken.MMMM]: (zonedDateTime) => formatDatePart(EN_US_LONG_MONTH_FORMATTER, zonedDateTime),
  [DateToken.ss]: ({ second }) => padWithZeros(second, PADDED_LENGTH),
  [DateToken.YYYY]: ({ year }) => padWithZeros(year, YEAR_LENGTH),
  [DateToken.Z]: ({ offset }) => offset,
};
