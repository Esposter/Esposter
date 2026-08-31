// The ISO 8601 calendar date, which is what a date means everywhere it is not being displayed to a choice the
// User made: `<input type="date">` reads and writes it, a query param serializes to it, a JSON round trip keeps
// It (a full datetime would be revived into a Date), and a change description prints it.
//
// Not `DateFormat["YYYY-MM-DD"]`, which spells the same thing and means something else — that is one option in
// The menu a sheet column's owner picks a display format from, and dropping it from that menu may not change
// What the wire carries.
export const ISO_DATE_FORMAT = "YYYY-MM-DD";
