import { escapeCsvCell } from "@/services/resource/sheet/csv/escapeCsvCell";

const FORMULA_TRIGGER_CHARACTERS: ReadonlySet<string> = new Set(["=", "+", "-", "@", "\t", "\r", "\n"]);
// For text the owner did not type, opened in a spreadsheet that would run it as a formula: a tab inside the quotes
// Ahead of the trigger is the one mitigation OWASP reports surviving an Excel save and reopen. The Sheet's own
// Export keeps escapeCsvCell, since it must round-trip the owner's formulas-as-text unchanged
export const escapeUntrustedCsvCell = (value: string, delimiter: string) =>
  FORMULA_TRIGGER_CHARACTERS.has(value.charAt(0))
    ? `"\t${value.replaceAll('"', '""')}"`
    : escapeCsvCell(value, delimiter);
