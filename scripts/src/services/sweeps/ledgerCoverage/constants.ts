// A trailer value is `<ledger> | <unit>`, the unit being the row's first cell with its backticks dropped, and a carried
// Trailer adds `| <date> · <model>` for a pass no trailer recorded
export const TRAILER_VALUE_SEPARATOR = " | ";
// What the status prints for a unit no pass has read
export const OPEN_CELL = "—";
// A date and the model that read on it, `<date> · <model>`, as a carried trailer and the status both write them; a
// Sample's value is `<size> · <defects>` the same way
export const SWEPT_CELL_SEPARATOR = " · ";
// The separator a unit cell puts between its directory and what it names of it, `dir — a, b` or `dir — the rest`
export const UNIT_CELL_SEPARATOR = " — ";
// What a unit cell's tail says when it names the directory's files no other unit holds
export const UNIT_CELL_REST = "the rest";
// How many open cells a question's sample draws, or every one of them where a question holds fewer
export const SAMPLE_SIZE = 30;
// The index rows whose units are a table of their own rather than cells of the area list
export const OWN_TABLE_LEDGERS: readonly string[] = ["component-reference"];
