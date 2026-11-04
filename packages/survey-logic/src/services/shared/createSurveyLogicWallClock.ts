// A wall-clock date: a Date whose UTC fields hold a calendar day and a time of day. No zone or daylight saving change
// Moves them, and the year is set whole, where Date.UTC reads a year from 0 to 99 as one of the 1900s
export const createSurveyLogicWallClock = (
  year: number,
  monthIndex: number,
  day: number,
  {
    hour = 0,
    millisecond = 0,
    minute = 0,
    second = 0,
  }: { hour?: number; millisecond?: number; minute?: number; second?: number } = {},
): Date => {
  const wallClock = new Date(0);
  wallClock.setUTCFullYear(year, monthIndex, day);
  wallClock.setUTCHours(hour, minute, second, millisecond);

  return wallClock;
};
