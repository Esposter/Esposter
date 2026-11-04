import { createSurveyLogicWallClock } from "#src/services/shared/createSurveyLogicWallClock";

// Moves a wall-clock date by whole months of its calendar, keeping its time of day. A day past the end of the month it lands in
// Becomes that month's last day, so the thirty-first plus one month is the twenty-eighth or the twenty-ninth
export const addSurveyLogicMonths = (wallClock: Date, months: number): void => {
  const monthIndex = wallClock.getUTCFullYear() * 12 + wallClock.getUTCMonth() + months;
  const year = Math.floor(monthIndex / 12);
  const month = monthIndex - year * 12;
  // Day zero of the next month is this month's last day
  const lastDay = createSurveyLogicWallClock(year, month + 1, 0);
  wallClock.setUTCFullYear(year, month, Math.min(wallClock.getUTCDate(), lastDay.getUTCDate()));
};
