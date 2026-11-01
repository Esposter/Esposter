// A wall-clock time the page writes, read in its own zone, as epoch milliseconds
export const readEpochMilliseconds = (value: string, timeZone: string): number =>
  Temporal.PlainDateTime.from(value.replace(" ", "T")).toZonedDateTime(timeZone).epochMilliseconds;
