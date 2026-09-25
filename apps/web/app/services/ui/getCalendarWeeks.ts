import { CALENDAR_WEEK_COUNT } from "@/services/ui/constants";
import { getStartOfWeek } from "@/util/date/getStartOfWeek";

// A month's days as a calendar's grid draws them, week by week from the start of the week its first day falls in:
// Always six weeks, so the grid keeps its height from one month to the next
export const getCalendarWeeks = (month: Temporal.PlainYearMonth) => {
  const start = getStartOfWeek(month.toPlainDate({ day: 1 }));
  return Array.from({ length: CALENDAR_WEEK_COUNT }, (_week, weekIndex) =>
    Array.from({ length: start.daysInWeek }, (_day, dayIndex) =>
      start.add({ days: weekIndex * start.daysInWeek + dayIndex }),
    ),
  );
};
