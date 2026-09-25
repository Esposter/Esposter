import { getStartOfWeek } from "@/util/date/getStartOfWeek";

// The day a key moves a grid of days to, as the WAI-ARIA date grid walks one: a day or a week by arrow, the week's ends
// By Home and End, and a month by Page Up and Page Down, a year with Shift. Any other key moves nowhere, nor does a key
// Held with Alt, Ctrl or Meta, which the grid leaves to whatever binds that chord — Alt+Left is the browser's Back
export const getNextGridDate = (event: KeyboardEvent, date: Temporal.PlainDate) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return undefined;

  switch (event.key) {
    case "ArrowDown":
      return date.add({ weeks: 1 });
    case "ArrowLeft":
      return date.subtract({ days: 1 });
    case "ArrowRight":
      return date.add({ days: 1 });
    case "ArrowUp":
      return date.subtract({ weeks: 1 });
    case "End":
      return getStartOfWeek(date).add({ days: date.daysInWeek - 1 });
    case "Home":
      return getStartOfWeek(date);
    case "PageDown":
      return event.shiftKey ? date.add({ years: 1 }) : date.add({ months: 1 });
    case "PageUp":
      return event.shiftKey ? date.subtract({ years: 1 }) : date.subtract({ months: 1 });
    default:
      return undefined;
  }
};
