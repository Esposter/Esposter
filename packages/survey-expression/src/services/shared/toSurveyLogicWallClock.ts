import { createSurveyLogicWallClock } from "#src/services/shared/createSurveyLogicWallClock";

// The wall clock an instant reads as on the local clock: its local calendar day and time of day, as the clock shows them
export const toSurveyLogicWallClock = (instant: Date): Date =>
  createSurveyLogicWallClock(instant.getFullYear(), instant.getMonth(), instant.getDate(), {
    hour: instant.getHours(),
    millisecond: instant.getMilliseconds(),
    minute: instant.getMinutes(),
    second: instant.getSeconds(),
  });
