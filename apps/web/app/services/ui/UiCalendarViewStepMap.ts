import { UiCalendarView } from "@/models/ui/UiCalendarView";

// How far each view steps, which its buttons, its shortcuts and Page Up and Page Down step it: a day, a month, or a week
// For either week
export const UiCalendarViewStepMap = {
  [UiCalendarView.Day]: { days: 1 },
  [UiCalendarView.Month]: { months: 1 },
  [UiCalendarView.Week]: { weeks: 1 },
  [UiCalendarView.WorkWeek]: { weeks: 1 },
} as const satisfies Record<UiCalendarView, Temporal.DurationLike>;
