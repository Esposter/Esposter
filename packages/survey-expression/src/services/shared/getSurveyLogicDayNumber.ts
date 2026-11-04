const MILLISECONDS_PER_DAY = 86_400_000;

// The calendar day a wall-clock date falls on, as a count of days from the epoch, so two times of one day share a number
export const getSurveyLogicDayNumber = (wallClock: Date): number =>
  Math.floor(wallClock.getTime() / MILLISECONDS_PER_DAY);
