import type { GameText } from "genshin-text";

import { fillGameTextValues, GameTextKey } from "genshin-text";

// The time a refresh is away, as the game's countdown shows it: its days, hours and minutes in the game's own
// Unit words. the days and hours are left out when none are left, so a refresh under an hour away reads as its minutes
// Alone
export const formatShopRefreshCountdown = (gameText: GameText, remaining: Temporal.Duration): string => {
  const { days, hours, minutes } = remaining.round({
    largestUnit: "day",
    roundingMode: "floor",
    smallestUnit: "minute",
  });
  const parts = [];
  if (days > 0) parts.push(fillGameTextValues(gameText[GameTextKey.WishTimeRemainingDays], days));
  if (days > 0 || hours > 0) parts.push(fillGameTextValues(gameText[GameTextKey.WishTimeRemainingHours], hours));
  parts.push(fillGameTextValues(gameText[GameTextKey.WishTimeRemainingMinutes], minutes));
  return parts.join(" ");
};
