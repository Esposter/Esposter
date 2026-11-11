import { getUniqueColumnNames } from "@/services/resource/sheet/dataSource/getUniqueColumnNames";
import { getXmlCell } from "@/services/resource/sheet/xml/getXmlCell";
import { takeOne } from "@esposter/shared";

// A row's cells are its child elements in order, then its attributes. A name the row repeats is numbered the way a
// Repeated header is, so no cell is filed under another cell's key
export const getXmlRowCells = (rowElement: Element, fileName: string) => {
  const cells = [
    ...Array.from(rowElement.children, (cellElement) => getXmlCell(cellElement, fileName)),
    ...Array.from(rowElement.attributes, ({ name, value }) => ({ name, text: value })),
  ];
  const uniqueNames = getUniqueColumnNames(cells.map(({ name }) => name));
  return new Map(cells.map(({ text }, index) => [takeOne(uniqueNames, index), text]));
};
