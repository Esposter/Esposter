import { CALENDAR_CLOCK_INTERVAL_MS } from "@/services/ui/constants";
import { getZonedDateTime } from "@esposter/shared";

// The time where the reader is, read again every minute, so a calendar left open past midnight moves on to the new day
// And the current-time line moves down today
export const useCalendarClock = () => {
  const nowDate = useNow({ scheduler: (callback) => useIntervalFn(callback, CALENDAR_CLOCK_INTERVAL_MS) });
  const now = computed(() => getZonedDateTime(nowDate.value));
  const today = computed(() => now.value.toPlainDate());
  return { now, today };
};
