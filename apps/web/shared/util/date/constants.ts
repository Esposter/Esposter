import { DateTokens } from "#shared/util/date/DateToken";

// The ISO 8601 calendar date, which is what a date means everywhere it is not being displayed to a choice the
// User made: `<input type="date">` reads and writes it, a query param serializes to it, a JSON round trip keeps
// It (a full datetime would be revived into a Date), and a change description prints it.
//
// Not `DateFormat["YYYY-MM-DD"]`, which spells the same thing and means something else — that is one option in
// The menu a sheet column's owner picks a display format from, and dropping it from that menu may not change
// What the wire carries.
export const ISO_DATE_FORMAT = "YYYY-MM-DD";
// Built from the token enum rather than written out, so a token added there is scanned for without a second
// Edit here. Longest first, because an alternation takes the first branch that matches: a token listed before a
// Longer one it prefixes (`M` before `MMMM`) would claim the first letter and leave the rest as literal text
export const DATE_TOKEN_REGEX = new RegExp(
  DateTokens.toSorted((firstDateToken, secondDateToken) => secondDateToken.length - firstDateToken.length).join("|"),
  "gu",
);
