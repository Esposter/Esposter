import type { CellValue } from "read-excel-file/browser";

// The reader hands a date-styled cell over as the UTC instant Excel stores, a wall clock with no zone. Its UTC
// Fields are that clock, so written with no offset the text reads back the same in every zone. A cell with no time
// Of day is written as its date alone, so a column of dates reads as dates rather than as datetimes. A serial past the
// Calendar's range is an Invalid Date, which has no ISO text, so it falls through to the text its Date gives
export const getCellText = (cell: CellValue | null | undefined) => {
  if (cell instanceof Date && !Number.isNaN(cell.getTime())) {
    const isoText = cell.toISOString();
    return isoText.endsWith("T00:00:00.000Z") ? isoText.slice(0, 10) : isoText.slice(0, 19);
  }
  return cell?.toString() ?? "";
};
