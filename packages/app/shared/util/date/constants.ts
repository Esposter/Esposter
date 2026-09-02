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
// Edit here — and so the alternation keeps the declaration order the enum documents.
export const DATE_TOKEN_REGEX = new RegExp(DateTokens.join("|"), "gu");
