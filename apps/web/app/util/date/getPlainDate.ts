import { getZonedDateTime } from "@esposter/shared";

export const getPlainDate = (date: Date): Temporal.PlainDate => getZonedDateTime(date).toPlainDate();
