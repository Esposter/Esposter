// A trailer value is `<ledger> | <unit>`, the unit being the row's first cell with its backticks dropped, and a carried
// Trailer adds `| <date> · <model>` for a pass no trailer recorded
export const TRAILER_VALUE_SEPARATOR = " | ";
// What the status prints for a unit no pass has read
export const OPEN_CELL = "—";
// A date and the model that read on it, `<date> · <model>`, as a carried trailer and the status both write them; a
// Sample's value is `<size> · <defects>` the same way
export const SWEPT_CELL_SEPARATOR = " · ";
