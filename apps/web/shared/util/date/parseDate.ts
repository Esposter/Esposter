import { DATE_TOKEN_REGEX } from "#shared/util/date/constants";
import { DateToken } from "#shared/util/date/DateToken";
import { DateTokenPatternMap } from "#shared/util/date/DateTokenPatternMap";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";

const REGEX_SPECIAL_CHARACTER_REGEX = /[.*+?^${}()|[\]\\]/gu;
const UTC_DESIGNATOR = "Z";
const UTC_OFFSET = "+00:00";

const escapeLiteral = (literal: string): string => literal.replace(REGEX_SPECIAL_CHARACTER_REGEX, String.raw`\$&`);
// Dayjs's strict `customParseFormat`, over Temporal: the format is compiled to an anchored regex, so a value
// With anything before, after or between its parts fails rather than being read partially, and the fields are
// Handed to Temporal with `overflow: "reject"` so a real calendar decides whether 31 February is a date.
export const parseDate = (value: string, format: string): Date | undefined => {
  const tokens: DateToken[] = [];
  let pattern = "";
  let literalIndex = 0;
  for (const match of format.matchAll(DATE_TOKEN_REGEX)) {
    const token = match[0] as DateToken;
    const tokenPattern = DateTokenPatternMap[token];
    if (tokenPattern === undefined)
      throw new InvalidOperationError(Operation.Read, parseDate.name, `"${format}" is a display-only format`);
    pattern += escapeLiteral(format.slice(literalIndex, match.index)) + tokenPattern;
    tokens.push(token);
    literalIndex = match.index + token.length;
  }

  const matched = new RegExp(`^${pattern}${escapeLiteral(format.slice(literalIndex))}$`, "u").exec(value);
  if (!matched) return undefined;

  const fields = { day: 1, hour: 0, minute: 0, month: 1, second: 0, year: 1970 };
  let offset: string | undefined;
  for (const [index, token] of tokens.entries()) {
    const part = matched[index + 1];
    if (part === undefined) return undefined;
    switch (token) {
      case DateToken.D:
      case DateToken.DD:
        fields.day = Number(part);
        break;
      case DateToken.H:
      case DateToken.HH:
        fields.hour = Number(part);
        break;
      case DateToken.M:
      case DateToken.MM:
        fields.month = Number(part);
        break;
      case DateToken.mm:
        fields.minute = Number(part);
        break;
      case DateToken.ss:
        fields.second = Number(part);
        break;
      case DateToken.YYYY:
        fields.year = Number(part);
        break;
      case DateToken.Z:
        offset = part === UTC_DESIGNATOR ? UTC_OFFSET : part;
        break;
      default:
        return undefined;
    }
  }

  return getResult(() => {
    const plainDateTime = Temporal.PlainDateTime.from(fields, { overflow: "reject" });
    // An offset in the value names the zone its wall clock was written in; without one the value is the
    // Reader's own wall clock, which is the zone every caller goes on to render it back in.
    return plainDateTime.toZonedDateTime(offset ?? Temporal.Now.timeZoneId()).epochMilliseconds;
  }).match(
    (epochMilliseconds) => new Date(epochMilliseconds),
    () => undefined,
  );
};
