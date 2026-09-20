// Whole days from one "YYYY-MM-DD" to another; a plain date carries no zone, so none can shift it
export const getDaysBetween = (fromIsoDate: string, toIsoDate: string): number =>
  Temporal.PlainDate.from(fromIsoDate).until(Temporal.PlainDate.from(toIsoDate)).days;
