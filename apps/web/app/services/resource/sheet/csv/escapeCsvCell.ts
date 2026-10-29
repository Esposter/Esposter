import { FORMULA_TRIGGER_CHARACTERS } from "@/services/resource/sheet/csv/constants";

// A spreadsheet runs a cell that opens with a formula trigger as a formula, and the text a file holds is not all the
// Owner's: an import's cells came from the file, and a survey or a participant list holds what others typed. So every
// CSV the app writes goes through here. A tab ahead of the trigger is the one mitigation OWASP reports surviving an
// Excel save and reopen. A number opens with a sign and no formula, so it is written as it is
export const escapeCsvCell = (value: string, delimiter: string) => {
  const isNumber = value.trim() !== "" && Number.isFinite(Number(value));
  if (FORMULA_TRIGGER_CHARACTERS.has(value.charAt(0)) && !isNumber) return `"\t${value.replaceAll('"', '""')}"`;
  else if (value.includes(delimiter) || value.includes('"') || value.includes("\n") || value.includes("\r"))
    return `"${value.replaceAll('"', '""')}"`;
  else return value;
};
