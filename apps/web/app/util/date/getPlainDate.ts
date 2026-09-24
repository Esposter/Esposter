import { getZonedDateTime } from "@esposter/shared";

export const getPlainDate = (date: Date) => getZonedDateTime(date).toPlainDate();
