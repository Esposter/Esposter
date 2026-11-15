// How much of time an event calendar shows at once: a month of days, or a day, the working days of a week or the whole
// Week in hours
export const UiCalendarView = { Day: "Day", Month: "Month", Week: "Week", WorkWeek: "Work week" } as const;
export type UiCalendarView = (typeof UiCalendarView)[keyof typeof UiCalendarView];

// Outlook's order, the shortest span first, which its shortcuts number one to four
export const UiCalendarViews: UiCalendarView[] = [
  UiCalendarView.Day,
  UiCalendarView.WorkWeek,
  UiCalendarView.Week,
  UiCalendarView.Month,
];
