// Moves a date by whole months of its calendar, keeping its time of day. A day past the end of the month it lands in
// Becomes that month's last day, so the thirty-first plus one month is the twenty-eighth or the twenty-ninth
export const addSurveyLogicMonths = (date: Date, months: number): void => {
  const monthIndex = date.getFullYear() * 12 + date.getMonth() + months;
  const year = Math.floor(monthIndex / 12);
  const month = monthIndex - year * 12;
  // Day zero of the next month is this month's last day, read in UTC so no zone or daylight saving change moves it
  const lastDay = new Date(0);
  lastDay.setUTCFullYear(year, month + 1, 0);
  date.setFullYear(year, month, Math.min(date.getDate(), lastDay.getUTCDate()));
};
