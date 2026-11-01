import type { DumpedDialog } from "#src/models/genshinText/DumpedDialog";

// The dialog table's rows, each a dialog with the field its scrambled id is kept under, and the name of that field
export interface DialogTable {
  dialogRows: (DumpedDialog & Record<string, unknown>)[];
  idKey: string;
}
