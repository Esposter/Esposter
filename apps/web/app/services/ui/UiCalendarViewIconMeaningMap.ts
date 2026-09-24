import { UiCalendarView } from "@/models/ui/UiCalendarView";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

// The mark each view's command leads with in the palette and the shortcuts dialog: a day's single column of hours, a
// Week's columns, a month's grid
export const UiCalendarViewIconMeaningMap = {
  [UiCalendarView.Day]: UiIconMeaning.Rows,
  [UiCalendarView.Month]: UiIconMeaning.Date,
  [UiCalendarView.Week]: UiIconMeaning.Columns,
  [UiCalendarView.WorkWeek]: UiIconMeaning.Columns,
} as const satisfies Record<UiCalendarView, UiIconMeaning>;
