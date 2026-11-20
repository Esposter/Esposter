import { MimeType } from "#shared/models/file/MimeType";
import { parseClipboardValuesByPosition } from "#src/services/resource/sheet/commands/parseClipboardValuesByPosition";
import { parseSheetClipboardRows } from "#src/services/resource/sheet/commands/parseSheetClipboardRows";
import { SHEET_CLIPBOARD_TYPE } from "#src/services/resource/sheet/constants";

// A copy's own format holds the values as they were copied. Anything else is text from outside the app, which reads as
// Text: a spreadsheet's formula-safe copy keeps its apostrophe here
export const readPastedValues = async (): Promise<string[][]> => {
  const items = await window.navigator.clipboard.read();
  const sheetItem = items.find(({ types }) => types.includes(SHEET_CLIPBOARD_TYPE));
  if (sheetItem) {
    const sheetRows = parseSheetClipboardRows(await (await sheetItem.getType(SHEET_CLIPBOARD_TYPE)).text());
    if (sheetRows) return sheetRows;
  }

  const textItem = items.find(({ types }) => types.includes(MimeType.PlainText));
  if (!textItem) return [];
  return parseClipboardValuesByPosition(await (await textItem.getType(MimeType.PlainText)).text());
};
