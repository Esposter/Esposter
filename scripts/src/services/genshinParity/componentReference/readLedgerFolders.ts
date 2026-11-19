import { LEDGER_ROW_REGEX } from "#src/services/genshinParity/componentReference/constants";

// Each unit row's folder, read off the first cell of the component reference ledger's table
export const readLedgerFolders = (text: string): string[] =>
  Array.from(text.matchAll(LEDGER_ROW_REGEX), ({ groups }) => groups?.folder ?? "");
