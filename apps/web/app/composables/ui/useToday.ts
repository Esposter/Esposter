import { CALENDAR_CLOCK_INTERVAL_MS } from "@/services/ui/constants";
import { getZonedDateTime } from "@esposter/shared";

// Today where the reader is, read again every minute, so a calendar left open past midnight moves on to the new day
export const useToday = () => {
  const now = useNow({ scheduler: (callback) => useIntervalFn(callback, CALENDAR_CLOCK_INTERVAL_MS) });
  return computed(() => getZonedDateTime(now.value).toPlainDate());
};
