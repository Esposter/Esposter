import { CLOCK_FIELD_LENGTH, MINUTES_PER_HOUR } from "#src/services/dev/constants";
import { MINUTES_PER_DAY } from "genshin-engine";

// Writes the game clock's minute of the day as the `HH:MM` a console line takes, the whole minute it is in
export const formatDevClockTime = (minutes: number): string => {
  const minuteOfDay = Math.floor(minutes) % MINUTES_PER_DAY;
  const hours = String(Math.floor(minuteOfDay / MINUTES_PER_HOUR)).padStart(CLOCK_FIELD_LENGTH, "0");
  const minuteOfHour = String(minuteOfDay % MINUTES_PER_HOUR).padStart(CLOCK_FIELD_LENGTH, "0");
  return `${hours}:${minuteOfHour}`;
};
