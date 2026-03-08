import { dayjs } from "#shared/services/dayjs";
import { DATE_FORMATS } from "@/services/tableEditor/file/constants";
import { takeOne } from "@esposter/shared";

export const inferDateFormat = (values: string[]): string => {
  const trimmedValues = values.map((v) => v.trim()).filter(Boolean);
  for (const format of DATE_FORMATS)
    if (trimmedValues.every((v) => dayjs(v, format, true).isValid())) return format;
  return takeOne(DATE_FORMATS);
};
