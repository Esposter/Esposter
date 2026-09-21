import type { Moment } from "#src/models/Moment";

import { LORE_MOMENT_LOCALE } from "#src/services/constants";

export const getMoment = (): Moment => {
  const now = Temporal.Now.zonedDateTimeISO();
  return {
    hour: now.hour,
    locale: new Intl.DateTimeFormat().resolvedOptions().locale,
    timeZone: now.timeZoneId,
    weekday: now.toLocaleString(LORE_MOMENT_LOCALE, { weekday: "long" }),
  };
};
