import { getZonedDateTime } from "#src/util/date/getZonedDateTime";

export const getPlainDate = (date: Date): Temporal.PlainDate => getZonedDateTime(date).toPlainDate();
