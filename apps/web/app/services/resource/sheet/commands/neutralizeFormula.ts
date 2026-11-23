import { FORMULA_TRIGGER_CHARACTERS } from "#src/services/resource/sheet/csv/constants";

// A cell a spreadsheet reads as a formula is prefixed with an apostrophe, the OWASP CSV-injection mitigation, so a
// Paste Into one shows the text instead of running it. A tab or a line break opens a cell of its own in TSV, so it
// Counts too
export const neutralizeFormula = (value: string) =>
  FORMULA_TRIGGER_CHARACTERS.has(value.charAt(0)) ? `'${value}` : value;
