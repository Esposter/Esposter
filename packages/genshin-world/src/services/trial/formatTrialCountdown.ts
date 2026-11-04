import { padWithZeros } from "@esposter/shared";

// A countdown's seconds in the minutes and seconds a clock shows, the seconds always two digits
export const formatTrialCountdown = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${padWithZeros(seconds % 60, 2)}`;
