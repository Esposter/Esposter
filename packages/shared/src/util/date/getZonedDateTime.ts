// A `Date` is an instant with no zone, and every calendar question — which day it falls on, when that day
// Started — is asked of the reader's own zone.
export const getZonedDateTime = (date: Date): Temporal.ZonedDateTime =>
  Temporal.Instant.fromEpochMilliseconds(date.getTime()).toZonedDateTimeISO(Temporal.Now.timeZoneId());
