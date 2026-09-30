import { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";

// The hours each sky starts at, as the wiki's login menu gallery gives them, by minute of the day
const DAWN_START_MINUTES = 4.5 * 60;
const DAY_START_MINUTES = 8 * 60;
const DUSK_START_MINUTES = 17 * 60;
const NIGHT_START_MINUTES = 19 * 60;
// The sky the game shows at a time of the player's own day: dawn from half past four, day from eight, dusk from
// Seventeen and night from nineteen
export const getLoginTimeOfDay = ({ hour, minute }: Temporal.PlainTime): LoginTimeOfDay => {
  const minutes = hour * 60 + minute;
  if (minutes >= NIGHT_START_MINUTES || minutes < DAWN_START_MINUTES) return LoginTimeOfDay.Night;
  else if (minutes < DAY_START_MINUTES) return LoginTimeOfDay.Dawn;
  else if (minutes < DUSK_START_MINUTES) return LoginTimeOfDay.Day;
  return LoginTimeOfDay.Dusk;
};
