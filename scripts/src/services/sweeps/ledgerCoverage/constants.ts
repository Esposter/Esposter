// One commit per record, its date and its trailers split by a control character no message carries
export const RECORD_SEPARATOR = "";
export const FIELD_SEPARATOR = "";
// A trailer value is `<ledger> | <unit>`, the unit being the row's first cell verbatim
export const TRAILER_VALUE_SEPARATOR = " | ";
export const OPEN_CELL = "—";
