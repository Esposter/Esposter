import { getResult } from "@esposter/shared";
import { z } from "zod";

const sheetClipboardRowsSchema = z.array(z.array(z.string()));

// The rows a copy wrote under the sheet's own format, or undefined for text that is not one. The clipboard is read from
// Whatever the browser holds, so the shape is checked rather than trusted
export const parseSheetClipboardRows = (text: string) => {
  // A cell can look like an ISO datetime,
  // oxlint-disable-next-line no-restricted-properties -- which reviving would turn into a Date the schema then refuses
  const result = getResult(() => sheetClipboardRowsSchema.parse(JSON.parse(text)));
  // Text that is not a copy in the sheet's format is another source's, so it reads as no rows
  return result.unwrapOr(undefined);
};
