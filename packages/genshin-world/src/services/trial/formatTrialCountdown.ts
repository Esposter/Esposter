// A countdown's seconds in the minutes and seconds a clock shows, the seconds always two digits
export const formatTrialCountdown = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
