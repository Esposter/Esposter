// The time a refresh is away, as the game's countdown shows it: its days, hours and minutes, the days and hours left out
// When none are left, so a refresh under an hour away reads as its minutes alone
export const formatShopRefreshCountdown = (remaining: Temporal.Duration): string => {
  const { days, hours, minutes } = remaining.round({
    largestUnit: "day",
    roundingMode: "floor",
    smallestUnit: "minute",
  });
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (days > 0 || hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}min`);
  return parts.join(" ");
};
