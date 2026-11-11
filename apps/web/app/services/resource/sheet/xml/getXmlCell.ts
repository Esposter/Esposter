import { XML_CELL_ELEMENT_NAME } from "@/services/resource/sheet/xml/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A cell holds text alone, so a child element of its own is refused, and the refusal names that element. A cell
// Element carrying a name attribute takes the attribute as its column name, the form serializeXmlCell writes for a
// Name that is not a valid XML name
export const getXmlCell = (cellElement: Element, fileName: string) => {
  if (cellElement.children.length > 0)
    throw new InvalidOperationError(
      Operation.Read,
      fileName,
      `${cellElement.tagName} holds child elements, and a cell can only hold text`,
    );
  const name =
    cellElement.tagName === XML_CELL_ELEMENT_NAME
      ? (cellElement.getAttribute("name") ?? cellElement.tagName)
      : cellElement.tagName;
  return { name, text: cellElement.textContent ?? "" };
};
