// A trailer value is `<ledger> | <unit>`, the unit being the row's first cell with its backticks dropped.
// A carried trailer adds `| <date> · <model>` for a pass no trailer recorded
export const TRAILER_VALUE_SEPARATOR = " | ";
// What the status prints for a unit no pass has read
export const OPEN_CELL = "—";
// A date and the model that read on it, `<date> · <model>`, as a carried trailer and the status both write them.
// A sample's value is `<size> · <defects>` the same way
export const SWEPT_CELL_SEPARATOR = " · ";
// The separator a unit cell puts between its directory and what it names of it, `dir — a, b` or `dir — the rest`
export const UNIT_CELL_SEPARATOR = " — ";
// What a unit cell's tail says when it names the directory's files no other unit holds
export const UNIT_CELL_REST = "the rest";
// How many open cells a question's sample draws, or every one of them where a question holds fewer
export const SAMPLE_SIZE = 30;
// The index rows that are not questions of the area list: a ledger with a table of its own, and `docs`.
// Its rows are its `docs/content` and `docs/skills` ledgers
export const OWN_TABLE_LEDGERS: readonly string[] = ["component-reference", "docs"];
// The area the derived openspec folder units sit in. `tooling.md` holds the rest of the openspec tree.
// Its `.openspec.yaml` files among them, so a folder belongs with its tooling
export const OPENSPEC_AREA = "tooling";
// The separator a sample line puts between its unit and its questions, `<unit> :: <question>, <question>…`
export const SAMPLE_UNIT_SEPARATOR = " :: ";
// The separator between a sample line's questions
export const SAMPLE_LEDGER_SEPARATOR = ", ";
// The file a sample is cut into for a reader, one batch a file, named by its number and this extension
export const BATCH_FILE_EXTENSION = ".txt";
// The file a reader writes its judgements into, one a line, beside the batch it was handed
export const READER_OUTPUT_EXTENSION = ".jsonl";
// The file a fixer is handed its units in, one batch of units a file
export const FIXER_UNIT_FILE_EXTENSION = ".json";
// The file a fixer writes its answers into, one finding a line
export const FIXER_RESULT_FILE_EXTENSION = ".result.jsonl";
// The most files one area unit holds, and the most lines of code, so one pass reads it in full in one sitting
export const UNIT_FILE_CAP = 40;
export const UNIT_LINE_CAP = 3000;
// The files whose lines count against the line cap: the code a pass reads in full. Prose, data and snapshots add files only
export const UNIT_CODE_FILE_REGEX = /\.(?:[cm]?[jt]sx?|vue|css)$/u;
