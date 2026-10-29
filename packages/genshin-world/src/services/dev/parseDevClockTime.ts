import { MINUTES_PER_HOUR } from "#src/services/dev/constants";

// Reads a clock a console line gave as `HH:MM`, already checked by its schema, as the minute of the day it names
export const parseDevClockTime = (time: string): number => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * MINUTES_PER_HOUR + minutes;
};
