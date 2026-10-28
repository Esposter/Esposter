import type { DateToken } from "#shared/util/date/DateToken";

import { DATE_TOKEN_REGEX } from "#shared/util/date/constants";
import { checkIsDateToken } from "#shared/util/date/DateToken";
import { DateTokenFormatterMap } from "#shared/util/date/DateTokenFormatterMap";
import { getZonedDateTime } from "@esposter/shared";

// The dayjs `format` this repo still needs, over Temporal: a format string is scanned for the tokens the enum
// Lists and everything between them is copied through as written. `DATE_TOKEN_REGEX` is built from the enum this map
// Is keyed by, so a match is a member of it by construction, and the guard only narrows it to the type the map takes.
export const formatDate = (date: Date, format: string): string => {
  const zonedDateTime = getZonedDateTime(date);
  return format.replace(DATE_TOKEN_REGEX, (token) =>
    checkIsDateToken(token) ? DateTokenFormatterMap[token](zonedDateTime) : token,
  );
};
