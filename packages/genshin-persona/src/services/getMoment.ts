import type { Moment } from "#src/models/Moment";

import { DATE_LOCALE } from "#src/services/constants";

export const getMoment = (): Moment => {
  const now = Temporal.Now.zonedDateTimeISO();
  return {
    hour: now.hour,
    locale: new Intl.DateTimeFormat().resolvedOptions().locale,
    timeZone: now.timeZoneId,
    weekday: now.toLocaleString(DATE_LOCALE, { weekday: "long" }),
  };
};
