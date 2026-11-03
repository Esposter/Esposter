const MILLISECONDS_PER_DAY = 86_400_000;

// Counts the calendar days between two dates, each read as its local day, so a time of day never adds one
export const getDaysBetween = (from: Date, to: Date): number => {
  const fromDay = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const toDay = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());

  return Math.ceil(Math.abs(toDay - fromDay) / MILLISECONDS_PER_DAY);
};
