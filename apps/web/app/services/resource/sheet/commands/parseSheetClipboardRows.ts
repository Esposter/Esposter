import { getResult } from "@esposter/shared";
import { z } from "zod";

const sheetClipboardRowsSchema = z.array(z.array(z.string()));

// The rows a copy wrote under the sheet's own format, or undefined for text that is not one. The clipboard is read from
// Whatever the browser holds, so the shape is checked rather than trusted
export const parseSheetClipboardRows = (text: string) => {
  // oxlint-disable-next-line no-restricted-properties -- a cell can look like an ISO datetime, which reviving would turn into a Date the schema then refuses
  const result = getResult(() => sheetClipboardRowsSchema.parse(JSON.parse(text)));
  return result.unwrapOr(undefined);
};
