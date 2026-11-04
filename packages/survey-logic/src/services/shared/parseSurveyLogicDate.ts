import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { createSurveyLogicWallClock } from "#src/services/shared/createSurveyLogicWallClock";
import { toSurveyLogicWallClock } from "#src/services/shared/toSurveyLogicWallClock";

// An ISO date, with an optional time of day: the separator is a T or the space RFC 3339 allows, the seconds and the fraction are
// Optional, and a zone is Z or an offset. The whole text must match, so a date with a word after it is not a date
const DATE_TEXT_REGEX =
  /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})(?:[T ](?<hour>\d{2}):(?<minute>\d{2})(?::(?<second>\d{2})(?:\.(?<fraction>\d+))?)?(?<zone>Z|[+-]\d{2}:\d{2})?)?$/u;

// The date an ISO text names, or undefined when the text names none. A text with no zone is its wall clock, read as written, so
// No zone or daylight saving change moves it. A text with a zone is the moment it names, read on the local clock
export const parseSurveyLogicDate = (value: SurveyLogicValue): Date | undefined => {
  if (typeof value !== "string") return undefined;

  const groups = DATE_TEXT_REGEX.exec(value)?.groups;
  if (groups === undefined) return undefined;

  const {
    day: dayText,
    fraction: fractionText = "",
    hour: hourText = "0",
    minute: minuteText = "0",
    month: monthText,
    second: secondText = "0",
    year: yearText,
    zone,
  } = groups;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  if (!checkIsCalendarDay(year, month, day) || hour > 23 || minute > 59 || second > 59) return undefined;

  const millisecond = Number(`${fractionText}00`.slice(0, 3));
  if (zone !== undefined) {
    const instant = new Date(
      `${yearText}-${monthText}-${dayText}T${hourText}:${minuteText}:${secondText}.${millisecond.toString().padStart(3, "0")}${zone}`,
    );
    return Number.isNaN(instant.getTime()) ? undefined : toSurveyLogicWallClock(instant);
  }

  return createSurveyLogicWallClock(year, month - 1, day, { hour, millisecond, minute, second });
};

// Whether a month and a day name a day that exists in the year, so the thirty-first of April is not one
const checkIsCalendarDay = (year: number, month: number, day: number): boolean => {
  const date = createSurveyLogicWallClock(year, month - 1, day);
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};
