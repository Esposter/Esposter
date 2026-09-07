import type { DateToken } from "#shared/util/date/DateToken";

import { DATE_TOKEN_REGEX } from "#shared/util/date/constants";
import { DateTokenFormatterMap } from "#shared/util/date/DateTokenFormatterMap";
import { getZonedDateTime } from "@esposter/shared";

// The dayjs `format` this repo still needs, over Temporal: a format string is scanned for the tokens the enum
// Lists and everything between them is copied through as written. The cast is the tokenizer's own alphabet
// Coming back — `DATE_TOKEN_REGEX` is built from the enum this map is keyed by, so a match is a member of it
// By construction.
export const formatDate = (date: Date, format: string): string => {
  const zonedDateTime = getZonedDateTime(date);
  return format.replace(DATE_TOKEN_REGEX, (token) => DateTokenFormatterMap[token as DateToken](zonedDateTime));
};
