import type { Moment } from "#src/models/Moment";

import { DATE_LOCALE } from "#src/services/constants";

export const getMoment = (): Moment => {
  const now = new Date();
  const { locale, timeZone } = new Intl.DateTimeFormat().resolvedOptions();
  return {
    hour: now.getHours(),
    locale,
    timeZone,
    weekday: now.toLocaleDateString(DATE_LOCALE, { weekday: "long" }),
  };
};
