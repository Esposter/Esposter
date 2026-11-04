import { CLOCK_FIELD_LENGTH, MINUTES_PER_HOUR } from "#src/services/dev/constants";
import { padWithZeros } from "@esposter/shared";
import { MINUTES_PER_DAY } from "genshin-engine";

// Writes the game clock's minute of the day as the `HH:MM` a console line takes, the whole minute it is in
export const formatDevClockTime = (minutes: number): string => {
  const minuteOfDay = Math.floor(minutes) % MINUTES_PER_DAY;
  const hours = padWithZeros(Math.floor(minuteOfDay / MINUTES_PER_HOUR), CLOCK_FIELD_LENGTH);
  const minuteOfHour = padWithZeros(minuteOfDay % MINUTES_PER_HOUR, CLOCK_FIELD_LENGTH);
  return `${hours}:${minuteOfHour}`;
};
