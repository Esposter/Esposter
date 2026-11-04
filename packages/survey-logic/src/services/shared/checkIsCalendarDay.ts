import { createSurveyLogicWallClock } from "#src/services/shared/createSurveyLogicWallClock";

// Whether a month and a day name a day that exists in the year, so the thirty-first of April is not one
export const checkIsCalendarDay = (year: number, month: number, day: number): boolean => {
  const date = createSurveyLogicWallClock(year, month - 1, day);
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};
