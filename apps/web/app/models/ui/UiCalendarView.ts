// How much of time an event calendar shows at once: a month of days, or a day, the working days of a week or the whole
// Week in hours
export enum UiCalendarView {
  Day = "Day",
  Month = "Month",
  Week = "Week",
  WorkWeek = "Work week",
}

// Outlook's order, the shortest span first, which its shortcuts number one to four
export const UiCalendarViews = [UiCalendarView.Day, UiCalendarView.WorkWeek, UiCalendarView.Week, UiCalendarView.Month];
